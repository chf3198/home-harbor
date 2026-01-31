# HomeHarbor - Real Estate Property Search 🏡

Professional-grade property search platform built with real-world data, demonstrating Staff Software Engineer skills for [Realtor.com](https://www.realtor.com).

[![Tests](https://img.shields.io/badge/tests-77%20passing-brightgreen)](https://github.com/chf3198/home-harbor)
[![Coverage](https://img.shields.io/badge/coverage-95.2%25-brightgreen)](https://github.com/chf3198/home-harbor)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)

## 🎯 Project Purpose

This is a **portfolio project** showcasing professional software engineering practices through **real-world git commit history** visible to recruiters. Every commit demonstrates:

- **TDD Mastery**: Strict RED-GREEN-REFACTOR cycle
- **Clean Architecture**: Testable functional design
- **Production Quality**: 95.2% test coverage, zero mock data
- **Professional Git**: Conventional commits, atomic changes, detailed bodies

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/chf3198/home-harbor.git
cd home-harbor
npm install

# Run tests
npm test

# Check coverage
npm test -- --coverage

# Lint code
npm run lint
```

## ✨ Features Implemented

### 🤖 AI-Powered Intelligence (NEW!)
- **Vision Analysis**: Property photo analysis using free OpenRouter Molmo2-8B
  - Exterior condition assessment (excellent/good/fair/poor)
  - Architectural style recognition (Colonial, Ranch, Victorian, etc.)
  - Amenity detection (garage, porch, deck, pool)
  - Curb appeal scoring (1-10 AI rating)
- **Chat Assistant**: Q&A about app features using 40+ free LLMs with cascading fallback
- **Property Photos**: Google Street View Static API integration ($200/mo free tier)
- **Cost**: **$0** - 100% free tier usage with production-grade capabilities
- **[Full AI Features Documentation](docs/AI_FEATURES_OVERVIEW.md)**

### Real Data Integration ✅
- **Dataset**: Connecticut Real Estate Sales (2001-2023)
- **Source**: [data.ct.gov](https://data.ct.gov/Housing-and-Development/Real-Estate-Sales-2001-2023-GL/5mzw-sjtu) (Public Domain)
- **Size**: 1M+ property records
- **Attributes**: Address, price, assessed value, property type, sale date, coordinates
- **Photos**: Google Street View (universal address coverage)

### Search & Filters ✅
- City search (case-insensitive)
- Price range filtering ($min-$max)
- Property type (Residential, Commercial, Industrial)
- Residential subtype (Single Family, Condo, Multi-Family)

### Advanced Features ✅
- Multi-field sorting (price, date, assessed value, city)
- Pagination (configurable page size, max 100)
- Streaming CSV loader (memory-efficient)
- Complete E2E integration tests

## 📊 Technical Metrics

- **77 tests** passing (all green)
- **95.2% coverage** (exceeds 80% threshold)
- **10 modules**, all <100 lines (ESLint enforced)
- **35+ commits** with professional messages
- **Zero mock data** (real CT government dataset)

## 🏗️ Architecture

**Pattern**: Testable Functional Design
- **80%+ pure functions** (no side effects)
- **Result pattern** (explicit error handling, no exceptions)
- **Streaming I/O** (handles 1M+ records efficiently)
- **Immutable operations** (filters/sort return new arrays)

```
src/property-search/
├── Property.js              # Domain entity with validation
├── csvLoader.js             # Streaming CSV parser
├── ctDataMapper.js          # Data mapper (CT schema → Property)
├── searchService.js         # City search
├── priceFilter.js           # Price range filter
├── typeFilter.js            # Property type filters
├── propertySorter.js        # Multi-field sorting
├── paginator.js             # Pagination
└── index.js                 # Public API (barrel export)
```

## 💡 Skills Demonstrated

### AI/ML Engineering (NEW!)
- ✅ Vision-language model integration (Molmo2-8B)
- ✅ Multi-model orchestration (40+ LLM cascade)
- ✅ Prompt engineering for vision tasks
- ✅ Cost optimization (free tier maximization)
- ✅ API fallback/retry logic
- ✅ Image analysis pipeline design

### Software Engineering
- ✅ Test-Driven Development (TDD)
- ✅ Clean Code principles
- ✅ SOLID design
- ✅ Functional programming
- ✅ Domain-Driven Design

### Testing
- ✅ Unit testing (Jest)
- ✅ Integration testing
- ✅ E2E testing with real data
- ✅ 95%+ code coverage
- ✅ Edge case handling

### DevOps
- ✅ Git workflow (conventional commits)
- ✅ Pre-commit hooks (security checks)
- ✅ Linting (ESLint)
- ✅ Code formatting (Prettier)
- ✅ CI/CD ready

### Data Engineering
- ✅ CSV parsing (streaming)
- ✅ Schema mapping
- ✅ Data validation
- ✅ Large dataset handling

## 📖 Documentation

- [Module Documentation](src/property-search/README.md) - Complete API reference
- [Architecture Decision Records](docs/) - Design rationale
- [File Organization Guide](.github/FILE_ORGANIZATION.md) - Keeping files small
- [Development Workflow](.github/DEVELOPMENT_WORKFLOW.md) - TDD process
- [Lessons Learned](LESSONS_LEARNED.md) - Session memory

## 🎓 Usage Example

```javascript
const {
  loadCsvFile,
  filterByPropertyType,
  filterByPriceRange,
  sortProperties,
  paginate
} = require('./src/property-search');

// Load real Connecticut data
const result = await loadCsvFile('data/ct-sample-50.csv');
const properties = result.value;

// Find affordable single-family homes in Avon
let results = properties;
results = searchByCity(results, 'Avon');
results = filterByPropertyType(results, 'Residential');
results = filterByResidentialType(results, 'Single Family');
results = filterByPriceRange(results, 200000, 400000);
results = sortProperties(results, 'price', 'asc');

const page = paginate(results, { page: 1, pageSize: 10 });
console.log(`Found ${page.totalItems} properties`);
```

## 🔮 Roadmap

### Phase 1: Backend ✅
- [x] Real data integration
- [x] Search & filtering
- [x] Sorting & pagination
- [x] 95%+ test coverage

### Phase 2: Backend Advanced ⏳
- [ ] Repository pattern (DB abstraction)
- [ ] Lambda handler (API Gateway)
- [ ] Full-text search
- [ ] Geographic filtering

### Phase 3: Frontend ⏳
- [ ] React application
- [ ] Property listing UI
- [ ] Search filters
- [ ] Responsive design

### Phase 4: Deployment ⏳
- [ ] GitHub Actions CI/CD
- [ ] AWS Lambda deployment
- [ ] CloudFront CDN
- [ ] Production monitoring

## 🤝 Project Context

**Built for**: Realtor.com Staff SWE Application  
**Timeline**: January 2026  
**Technologies**: Node.js, Jest, ESLint, AWS (planned)  
**Data Source**: Connecticut Open Data Portal  

## 📄 License

MIT License - See [LICENSE](LICENSE)

## 👤 Author

**Curtis Franks**  
GitHub: [@chf3198](https://github.com/chf3198)  
Demonstrating production-ready code for Realtor.com recruitment

---

**Note**: This project uses real government data (Public Domain) and follows industry best practices. All commits demonstrate professional software engineering skills through clean git history.
