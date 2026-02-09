#!/bin/bash
# fix-vscode-chat-history.sh
# 
# Fixes VS Code Copilot chat history loss on removable drives (SSD/USB).
#
# ROOT CAUSE: VS Code generates workspace IDs using folder path + inode (ctime).
# On removable drives via 9p filesystem (ChromeOS), inodes change between mounts,
# causing VS Code to create a NEW workspace storage folder on each reboot.
# This scatters chat history across multiple folders.
#
# SOLUTION: 
# 1. Find the "canonical" workspace (largest chat sessions)
# 2. Merge all chat sessions into it
# 3. Update workspace.json files to reference canonical workspace
# 4. Create symlinks so future workspace IDs use the same chat storage
#
# Usage: ./fix-vscode-chat-history.sh [--dry-run]

set -e

WORKSPACE_STORAGE="$HOME/.config/Code/User/workspaceStorage"
SSD_PATTERN="SSD"  # Pattern to match in workspace.json folder URIs
DRY_RUN=false

if [[ "$1" == "--dry-run" ]]; then
    DRY_RUN=true
    echo "=== DRY RUN MODE - No changes will be made ==="
fi

echo "=== VS Code Chat History Fix for Removable Drives ==="
echo ""

# Find all workspace folders for SSD Drive
ssd_workspaces=()
workspace_sizes=()

for dir in "$WORKSPACE_STORAGE"/*/; do
    if [[ -f "$dir/workspace.json" ]]; then
        folder_uri=$(cat "$dir/workspace.json" 2>/dev/null | grep -o '"folder"[^}]*' | head -1)
        if echo "$folder_uri" | grep -q "$SSD_PATTERN"; then
            ws_id=$(basename "$dir")
            chat_size=0
            if [[ -d "$dir/chatSessions" ]]; then
                chat_size=$(du -s "$dir/chatSessions" 2>/dev/null | cut -f1 || echo "0")
            fi
            ssd_workspaces+=("$ws_id")
            workspace_sizes+=("$chat_size")
        fi
    fi
done

if [[ ${#ssd_workspaces[@]} -eq 0 ]]; then
    echo "No SSD Drive workspaces found. Nothing to fix."
    exit 0
fi

echo "Found ${#ssd_workspaces[@]} workspace folders for SSD Drive:"
for i in "${!ssd_workspaces[@]}"; do
    echo "  ${ssd_workspaces[$i]} (chat size: ${workspace_sizes[$i]} KB)"
done
echo ""

# Find canonical workspace (largest chat sessions)
max_size=0
canonical_ws=""
for i in "${!ssd_workspaces[@]}"; do
    if [[ ${workspace_sizes[$i]} -gt $max_size ]]; then
        max_size=${workspace_sizes[$i]}
        canonical_ws="${ssd_workspaces[$i]}"
    fi
done

if [[ -z "$canonical_ws" ]]; then
    echo "Could not determine canonical workspace. Using first one."
    canonical_ws="${ssd_workspaces[0]}"
fi

echo "Canonical workspace (largest chat history): $canonical_ws"
echo "Chat storage size: $max_size KB"
echo ""

canonical_chat_dir="$WORKSPACE_STORAGE/$canonical_ws/chatSessions"

# Ensure canonical chat directory exists
if ! $DRY_RUN && [[ ! -d "$canonical_chat_dir" ]]; then
    mkdir -p "$canonical_chat_dir"
fi

# Merge chat sessions from other workspaces
echo "=== Merging chat sessions into canonical workspace ==="
merged_count=0
for ws in "${ssd_workspaces[@]}"; do
    if [[ "$ws" == "$canonical_ws" ]]; then
        continue
    fi
    
    other_chat_dir="$WORKSPACE_STORAGE/$ws/chatSessions"
    if [[ -d "$other_chat_dir" ]]; then
        for session_file in "$other_chat_dir"/*.json; do
            if [[ -f "$session_file" ]]; then
                session_name=$(basename "$session_file")
                target_file="$canonical_chat_dir/$session_name"
                
                if [[ -f "$target_file" ]]; then
                    # Compare sizes, keep larger one
                    source_size=$(stat -c%s "$session_file" 2>/dev/null || echo "0")
                    target_size=$(stat -c%s "$target_file" 2>/dev/null || echo "0")
                    if [[ $source_size -gt $target_size ]]; then
                        echo "  Updating: $session_name (larger in $ws)"
                        if ! $DRY_RUN; then
                            cp "$session_file" "$target_file"
                        fi
                        merged_count=$((merged_count + 1))
                    fi
                else
                    echo "  Copying: $session_name from $ws"
                    if ! $DRY_RUN; then
                        cp "$session_file" "$target_file"
                    fi
                    merged_count=$((merged_count + 1))
                fi
            fi
        done
    fi
done

echo ""
echo "Merged $merged_count chat session(s)"
echo ""

# Merge chat indexes from all workspace state.vscdb databases
echo "=== Merging chat indexes from workspace state databases ==="
merge_chat_indexes() {
    local canonical_db="$WORKSPACE_STORAGE/$canonical_ws/state.vscdb"
    
    if [[ ! -f "$canonical_db" ]]; then
        echo "  WARNING: Canonical workspace state.vscdb not found"
        return
    fi
    
    # Get current canonical index
    local canonical_index=$(sqlite3 "$canonical_db" "SELECT value FROM ItemTable WHERE key='chat.ChatSessionStore.index'" 2>/dev/null || echo '{"version":1,"entries":{}}')
    
    # Collect all session entries from all SSD workspaces
    local all_entries=""
    local index_merged=0
    
    for ws in "${ssd_workspaces[@]}"; do
        local ws_db="$WORKSPACE_STORAGE/$ws/state.vscdb"
        if [[ -f "$ws_db" ]]; then
            local ws_index=$(sqlite3 "$ws_db" "SELECT value FROM ItemTable WHERE key='chat.ChatSessionStore.index'" 2>/dev/null || echo '{}')
            local entry_count=$(echo "$ws_index" | python3 -c "import sys,json; d=json.loads(sys.stdin.read()) if sys.stdin.readable() else {}; print(len(d.get('entries',{})))" 2>/dev/null || echo "0")
            if [[ "$entry_count" != "0" ]]; then
                echo "  Found $entry_count session(s) in $ws"
                index_merged=$((index_merged + entry_count))
            fi
        fi
    done
    
    # Use Python to merge all indexes
    if ! $DRY_RUN; then
        python3 << 'PYTHON_SCRIPT'
import sqlite3
import json
import os
import sys

workspace_storage = os.environ.get('WORKSPACE_STORAGE', os.path.expanduser('~/.config/Code/User/workspaceStorage'))
canonical_ws = os.environ.get('CANONICAL_WS', '')
ssd_workspaces = os.environ.get('SSD_WORKSPACES', '').split(':')

if not canonical_ws:
    print("  ERROR: No canonical workspace set")
    sys.exit(1)

canonical_db = os.path.join(workspace_storage, canonical_ws, 'state.vscdb')
if not os.path.exists(canonical_db):
    print(f"  ERROR: Canonical state.vscdb not found: {canonical_db}")
    sys.exit(1)

# Collect all entries from all workspaces
merged_entries = {}
for ws in ssd_workspaces:
    ws = ws.strip()
    if not ws:
        continue
    ws_db = os.path.join(workspace_storage, ws, 'state.vscdb')
    if not os.path.exists(ws_db):
        continue
    try:
        conn = sqlite3.connect(ws_db)
        cursor = conn.execute("SELECT value FROM ItemTable WHERE key='chat.ChatSessionStore.index'")
        row = cursor.fetchone()
        conn.close()
        if row:
            data = json.loads(row[0])
            for key, entry in data.get('entries', {}).items():
                # Use session ID as unique key to avoid duplicates
                session_id = entry.get('sessionId', key)
                if session_id not in merged_entries:
                    merged_entries[session_id] = entry
                else:
                    # Keep the more recent one
                    existing_date = merged_entries[session_id].get('lastMessageDate', 0)
                    new_date = entry.get('lastMessageDate', 0)
                    if new_date > existing_date:
                        merged_entries[session_id] = entry
    except Exception as e:
        print(f"  Warning: Could not read {ws}: {e}")

print(f"  Total unique sessions after merge: {len(merged_entries)}")

# Create merged index
merged_index = {
    "version": 1,
    "entries": {entry.get('sessionId', k): entry for k, entry in merged_entries.items()}
}

# Update canonical state.vscdb
try:
    conn = sqlite3.connect(canonical_db)
    conn.execute("UPDATE ItemTable SET value=? WHERE key='chat.ChatSessionStore.index'", 
                 [json.dumps(merged_index)])
    if conn.total_changes == 0:
        conn.execute("INSERT INTO ItemTable (key, value) VALUES (?, ?)",
                     ['chat.ChatSessionStore.index', json.dumps(merged_index)])
    conn.commit()
    conn.close()
    print(f"  Updated canonical workspace index with {len(merged_entries)} sessions")
except Exception as e:
    print(f"  ERROR: Could not update canonical index: {e}")
    sys.exit(1)

PYTHON_SCRIPT
    fi
    
    echo "  Chat index merge complete"
}

# Export variables for Python script
export WORKSPACE_STORAGE
export CANONICAL_WS="$canonical_ws"
export SSD_WORKSPACES=$(IFS=:; echo "${ssd_workspaces[*]}")

merge_chat_indexes

echo ""

# Sync merged index to ALL SSD workspace state databases
echo "=== Syncing merged index to all workspace state databases ==="
if ! $DRY_RUN; then
    python3 << 'PYTHON_SYNC'
import sqlite3
import json
import os

workspace_storage = os.environ.get('WORKSPACE_STORAGE', os.path.expanduser('~/.config/Code/User/workspaceStorage'))
canonical_ws = os.environ.get('CANONICAL_WS', '')
ssd_workspaces = os.environ.get('SSD_WORKSPACES', '').split(':')

canonical_db = os.path.join(workspace_storage, canonical_ws, 'state.vscdb')
if not os.path.exists(canonical_db):
    print("  ERROR: Canonical state.vscdb not found")
    exit(1)

# Read merged index from canonical
try:
    conn = sqlite3.connect(canonical_db)
    cursor = conn.execute("SELECT value FROM ItemTable WHERE key='chat.ChatSessionStore.index'")
    row = cursor.fetchone()
    conn.close()
    if row:
        merged_index = row[0]
        entry_count = len(json.loads(merged_index).get('entries', {}))
    else:
        print("  ERROR: No chat index in canonical database")
        exit(1)
except Exception as e:
    print(f"  ERROR: Could not read canonical index: {e}")
    exit(1)

# Sync to all other workspaces
synced = 0
for ws in ssd_workspaces:
    ws = ws.strip()
    if not ws or ws == canonical_ws:
        continue
    ws_db = os.path.join(workspace_storage, ws, 'state.vscdb')
    if not os.path.exists(ws_db):
        continue
    try:
        conn = sqlite3.connect(ws_db)
        conn.execute("UPDATE ItemTable SET value=? WHERE key='chat.ChatSessionStore.index'", [merged_index])
        if conn.total_changes == 0:
            conn.execute("INSERT INTO ItemTable (key, value) VALUES (?, ?)", ['chat.ChatSessionStore.index', merged_index])
        conn.commit()
        conn.close()
        synced += 1
    except Exception as e:
        print(f"  Warning: Could not sync to {ws}: {e}")

print(f"  Synced {entry_count} sessions to {synced} workspace databases")
PYTHON_SYNC
fi

echo ""

# Create symlinks for future workspace IDs
echo "=== Creating symlinks for other workspace chatSessions ==="
symlink_count=0
for ws in "${ssd_workspaces[@]}"; do
    if [[ "$ws" == "$canonical_ws" ]]; then
        continue
    fi
    
    other_chat_dir="$WORKSPACE_STORAGE/$ws/chatSessions"
    
    # Skip if already a symlink
    if [[ -L "$other_chat_dir" ]]; then
        echo "  $ws: Already symlinked"
        continue
    fi
    
    # Remove old directory and create symlink
    if [[ -d "$other_chat_dir" ]]; then
        echo "  $ws: Replacing directory with symlink"
        if ! $DRY_RUN; then
            rm -rf "$other_chat_dir"
            ln -s "$canonical_chat_dir" "$other_chat_dir"
        fi
        symlink_count=$((symlink_count + 1))
    else
        echo "  $ws: Creating symlink"
        if ! $DRY_RUN; then
            mkdir -p "$WORKSPACE_STORAGE/$ws"
            ln -s "$canonical_chat_dir" "$other_chat_dir"
        fi
        symlink_count=$((symlink_count + 1))
    fi
done

echo ""
echo "Created $symlink_count symlink(s)"
echo ""

# Summary
echo "=== Summary ==="
echo "Canonical workspace: $canonical_ws"
echo "Chat sessions merged: $merged_count"
echo "Symlinks created: $symlink_count"
echo ""
echo "Chat history location: $canonical_chat_dir"
ls -la "$canonical_chat_dir" 2>/dev/null | head -10
echo ""

if $DRY_RUN; then
    echo "=== DRY RUN COMPLETE - Run without --dry-run to apply changes ==="
else
    echo "=== DONE ==="
    echo ""
    echo "NOTE: On next VS Code restart after reboot, a NEW workspace folder"
    echo "will be created. Run this script again to symlink it to the canonical"
    echo "chat storage."
    echo ""
    echo "TIP: Add to your shell profile:"
    echo "  alias fix-vscode-chat='/path/to/fix-vscode-chat-history.sh'"
fi
