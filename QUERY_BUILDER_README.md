# Query Builder Native Component

A comprehensive, native EmberJS query builder component for creating complex filtering queries without jQuery dependencies. This component generates queries in the specific format required by the Projects4Me backend API.

## Overview

The Query Builder Native component provides both visual and text-based interfaces for building complex queries. It supports nested groups, multiple operators, and various field types while maintaining compatibility with the existing Projects4Me query format.

## Features

### Dual Interface Modes
- **Visual Mode**: Drag-and-drop interface with form controls
- **Text Mode**: Direct text editing with autocomplete and syntax highlighting

### Query Capabilities
- Multiple field types (string, date, select, etc.)
- Comprehensive operator support (equals, contains, between, etc.)
- Nested query groups with AND/OR logic
- Real-time query validation
- Query preview and generation

### User Experience
- Responsive Bootstrap-based design
- Internationalization support
- Accessibility compliance
- Comprehensive error handling
- Keyboard navigation support

## Query Format

The component generates queries in this specific format:

```
((Module.field OPERATOR value) LOGICAL_OPERATOR (Module.field OPERATOR value))
```

### Supported Operators

| Operator | Symbol | Description |
|----------|--------|-------------|
| Equals | `:` | Exact match |
| Not Equals | `!:` | Not equal to |
| Less Than | `<` | Less than |
| Greater Than | `>` | Greater than |
| Less Than or Equal | `<:` | Less than or equal to |
| Greater Than or Equal | `>:` | Greater than or equal to |
| Contains | `CONTAINS` | Contains substring or CSV values |
| Starts With | `STARTS` | Starts with substring |
| Ends With | `ENDS` | Ends with substring |
| Between | `BETWEEN` | Between two values |
| Is Null | `NULL` | Field is null |
| Is Empty | `EMPTY` | Field is empty |
| Not | `!` | Negation prefix |

### Logical Operators
- `AND` - All conditions must be true
- `OR` - Any condition can be true

### Example Queries

```javascript
// Simple condition
"((Issue.subject CONTAINS 'bug'))"

// Multiple conditions with AND
"((Issue.subject CONTAINS 'bug') AND (Issue.priority : 'high'))"

// Multiple conditions with OR
"((Issue.status : 'open') OR (Issue.status : 'in_progress'))"

// Complex nested conditions
"(((Issue.subject CONTAINS 'bug') AND (Issue.priority : 'high')) OR (Issue.assignee : 'john.doe'))"

// Date range query
"((Issue.startDate > '2023-01-01') AND (Issue.endDate < '2023-12-31'))"

// Multiple values with CONTAINS
"((Issue.status CONTAINS 'open,in_progress,pending'))"

// Null checks
"((Issue.assignee !: NULL) AND (Issue.milestone CONTAINS 'v1.0'))"
```

## Component Usage

### Basic Implementation

```handlebars
<QueryBuilderNative::QueryBuilderNative 
  @filters={{this.availableFilters}}
  @query={{this.currentQuery}}
  @onChange={{this.handleQueryChange}}
  @title="Issue Filters"
/>
```

### Filter Configuration

```javascript
// Define available filters
filters: [
  {
    id: 'Issue.subject',
    label: 'Subject',
    type: 'string',
    operators: ['equal', 'not_equal', 'contains', 'not_contains', 'begins_with', 'ends_with']
  },
  {
    id: 'Issue.status',
    label: 'Status',
    type: 'string',
    input: 'select',
    values: {
      'new': 'New',
      'in_progress': 'In Progress',
      'done': 'Done'
    },
    operators: ['equal', 'not_equal', 'in', 'not_in']
  },
  {
    id: 'Issue.startDate',
    label: 'Start Date',
    type: 'date',
    operators: ['equal', 'not_equal', 'less', 'greater', 'between', 'is_null']
  }
]
```

### Component Arguments

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `@filters` | Array | Yes | Available filter definitions |
| `@query` | String | No | Initial query string |
| `@onChange` | Function | Yes | Callback when query changes |
| `@title` | String | No | Component title |
| `@mode` | String | No | Initial mode ('visual' or 'text') |
| `@disabled` | Boolean | No | Disable the component |

## Architecture

### Component Structure

```
app/components/query-builder-native/
├── query-builder-native.js          # Main component
├── query-builder-native.hbs         # Main template
├── query-rule.js                    # Individual rule component
├── query-rule.hbs                   # Rule template
├── query-group.js                   # Rule group component
├── query-group.hbs                  # Group template
├── autocomplete-input.js            # Text mode autocomplete
└── autocomplete-input.hbs           # Autocomplete template
```

### Data Flow

1. **Filter Definition**: Parent provides filter configuration
2. **Query Parsing**: Component parses initial query string
3. **Visual Representation**: Converts query to visual rules/groups
4. **User Interaction**: User modifies rules through UI
5. **Query Generation**: Component generates updated query string
6. **Change Notification**: Parent receives updated query via callback

### State Management

The component maintains internal state for:
- Current mode (visual/text)
- Query structure (rules and groups)
- Validation errors
- UI state (autocomplete, selections)

## Testing

### Integration Tests

Comprehensive BDD-style tests cover:
- Component rendering and mode switching
- Rule creation, modification, and removal
- Group management and nesting
- Query generation and validation
- User interactions and keyboard navigation

### Test Structure

```javascript
// Example test
test('it adds and removes rules in visual mode', async function(assert) {
  await render(hbs`<QueryBuilderNative::QueryBuilderNative .../>`);
  
  await click('[data-test-add-rule]');
  assert.dom('[data-test-query-rule]').exists({ count: 1 });
  
  await click('[data-test-remove-rule]');
  assert.dom('[data-test-query-rule]').doesNotExist();
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific component tests
npm test -- --filter="query-builder-native"

# Run with coverage
npm run test:coverage
```

## Styling

### CSS Classes

The component uses Bootstrap 4+ classes with custom enhancements:

```scss
.query-builder-native {
  // Main component wrapper
  
  .query-builder-visual {
    // Visual mode container
  }
  
  .query-builder-text {
    // Text mode container
  }
  
  .query-rule {
    // Individual rule styling
  }
  
  .query-group {
    // Rule group styling
  }
}
```

### Customization

Override default styles by targeting specific classes:

```scss
.query-builder-native {
  .query-rule {
    border-left-color: #your-color;
  }
  
  .btn-primary {
    background-color: #your-primary-color;
  }
}
```

## Internationalization

### Translation Keys

```json
{
  "views": {
    "components": {
      "queryBuilder": {
        "modes": {
          "visual": "Visual",
          "text": "Text"
        },
        "buttons": {
          "addRule": "Add Rule",
          "addGroup": "Add Group",
          "clearAll": "Clear All"
        },
        "labels": {
          "rulesConnection": "Rules Connection",
          "queryString": "Query String",
          "generatedQuery": "Generated Query"
        },
        "operators": {
          "equals": "Equals",
          "contains": "Contains",
          "between": "Between"
        },
        "help": {
          "title": "Query Syntax Help",
          "examples": "Examples"
        }
      }
    }
  }
}
```

### Adding New Languages

1. Add translation keys to `translations/{locale}.json`
2. Test with different locales
3. Ensure RTL support if needed

## Performance Considerations

### Optimization Strategies

- **Lazy Loading**: Components load only when needed
- **Debounced Updates**: Query changes are debounced to prevent excessive updates
- **Virtual Scrolling**: Large filter lists use virtual scrolling
- **Memoization**: Expensive computations are memoized

### Memory Management

- Event listeners are properly cleaned up
- Component state is reset on destroy
- Large objects are released when no longer needed

## Browser Support

### Supported Browsers

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

### Polyfills

Required polyfills for older browsers:
- Promise polyfill
- Array.from polyfill
- Object.assign polyfill

## Accessibility

### WCAG Compliance

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels and roles
- **Focus Management**: Logical focus order
- **Color Contrast**: Meets WCAG AA standards

### Accessibility Features

- High contrast mode support
- Reduced motion support
- Screen reader announcements
- Keyboard shortcuts

## Migration Guide

### From jQuery Query Builder

If migrating from a jQuery-based query builder:

1. **Update Templates**: Replace jQuery selectors with Ember data attributes
2. **Refactor Logic**: Move jQuery logic to Ember actions and computed properties
3. **Update Tests**: Replace jQuery-based tests with Ember test helpers
4. **Style Updates**: Ensure Bootstrap classes are compatible

### Breaking Changes

- jQuery dependency removed
- Different event handling pattern
- Updated CSS class structure
- New translation key structure

## Troubleshooting

### Common Issues

**Query not updating**
- Ensure `@onChange` callback is properly bound
- Check for JavaScript errors in console
- Verify filter configuration is correct

**Styling issues**
- Ensure Bootstrap CSS is loaded
- Check for CSS conflicts
- Verify custom styles are properly scoped

**Performance problems**
- Reduce number of filters if possible
- Implement pagination for large datasets
- Use debouncing for frequent updates

### Debug Mode

Enable debug mode for additional logging:

```javascript
// In component
this.set('debugMode', true);
```

## Contributing

### Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm start`
4. Run tests: `npm test`

### Code Standards

- Follow Ember.js conventions
- Use ESLint configuration
- Write comprehensive tests
- Document public APIs
- Follow accessibility guidelines

### Pull Request Process

1. Create feature branch
2. Write tests for new functionality
3. Ensure all tests pass
4. Update documentation
5. Submit pull request with clear description

## License

Projects4Me Copyright (c) 2017. Licensing: http://legal.projects4.me/LICENSE.txt

---

For additional support or questions, please refer to the Projects4Me documentation or contact the development team.
