# Data visualization

This folder contains HTML and JavaScript code to display the JSON data files generated by performance test runs.

## Core structure 

All logic is build around [Chart.js](https://www.chartjs.org): The HTML pages for the different test types contain suitable chart placeholders that are filled by the corresponding/referenced JavaScript modules.

## Concepts

All data to be displayed is loaded into a JSON structure from which it is re-packaged for display in either a line (time series) or bar chart (single day) display. Color-coding, utility functions and OQS-specific methods are co-located in a central javascript module that is called from the test-specific visualization scripts. All filter logic is driven by an HTML form suitably queried by JavaScript code.

## Feature sets 

Mostly documented in the [issue that drove code-creation](https://github.com/open-quantum-safe/speed/issues/5).