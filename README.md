# ML Data Pipeline

Prepare data for ML models. Ferrow ML agents.

```javascript
const pipeline = new MLDataPipeline();
pipeline.load(csvFile).normalize().shuffle().split(0.8);
```

Features: Normalization, augmentation, splitting, Ferrow ML.
License: MIT
