from pathlib import Path
import json
import joblib
import pandas as pd
from sklearn.compose import TransformedTargetRegressor
from sklearn.ensemble import ExtraTreesRegressor
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import GroupShuffleSplit

DATA = Path('/mnt/data/oceanfusion_real_training.csv')
OUT = Path('/mnt/data/oceanfusion_real_models')
OUT.mkdir(exist_ok=True)
features = ['latitude','longitude','depth_m','temperature_c','salinity_psu','oxygen_umol_kg']
target = 'shannon_diversity'
df = pd.read_csv(DATA)
X, y = df[features], df[target]
groups = (df['latitude'].round(0).astype(str) + '_' + df['longitude'].round(0).astype(str)).values
train_idx, test_idx = next(GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=42).split(X,y,groups))
model = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('regressor', ExtraTreesRegressor(n_estimators=700, min_samples_leaf=3, random_state=42, n_jobs=-1)),
])
model.fit(X.iloc[train_idx], y.iloc[train_idx])
pred = model.predict(X.iloc[test_idx])
metrics = {
    'rows': int(len(df)),
    'train_rows': int(len(train_idx)),
    'test_rows': int(len(test_idx)),
    'features': features,
    'target': target,
    'model': 'ExtraTreesRegressor',
    'validation': 'GroupShuffleSplit using rounded 1-degree latitude/longitude cells',
    'mae': float(mean_absolute_error(y.iloc[test_idx], pred)),
    'rmse': float(mean_squared_error(y.iloc[test_idx], pred)**0.5),
    'r2': float(r2_score(y.iloc[test_idx], pred)),
    'training_source': 'Tara Oceans PANGAEA biodiversity + depth-specific environmental context',
    'biodiversity_source_doi': '10.1594/PANGAEA.853809',
    'environment_source_doi': '10.1594/PANGAEA.853810',
}
# Refit on all real rows for production artifact.
model.fit(X,y)
joblib.dump({'model': model, 'features': features, 'target': target, 'model_name': 'ExtraTreesRegressor', 'training_source': metrics['training_source']}, OUT/'biodiversity_model.joblib')
(OUT/'metrics.json').write_text(json.dumps(metrics,indent=2))
print(json.dumps(metrics,indent=2))
