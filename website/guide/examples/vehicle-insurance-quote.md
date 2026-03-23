# Vehicle Insurance Quote

A vehicle insurance quoting form with coverage selection, driver history, and computed premium.

**Features demonstrated:**

- Component type swapping (Dropdown → RadioGroup) based on coverage category
- Computed premium estimate using `$fn` value functions and `$values` expressions
- Conditional driver history fields shown for drivers under 25
- Cross-field validation between policy start date and vehicle purchase date
- Hidden fields revealed based on `notIn` and `arrayContains` condition operators

[Try it in the playground](/?example=vehicle-insurance-quote)

[View in Storybook](https://bghcore.github.io/formosaic/storybook/?path=/story/examples-vehicle-insurance-quote--default)
