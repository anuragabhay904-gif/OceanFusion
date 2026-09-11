from pathlib import Path
import re
import zipfile
import pandas as pd

ROOT = Path('/mnt/data')
BIO = ROOT / 'TARA_sample_biodiv.tab'
ENV_ZIP = ROOT / 'dataset875582.zip'
OUT = ROOT / 'oceanfusion_real_training.csv'

# Parse PANGAEA biodiversity table header.
with BIO.open(encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()
bi_header = next(i for i, line in enumerate(lines) if line.startswith('Sample ID'))
bio = pd.read_csv(BIO, sep='\t', skiprows=bi_header, low_memory=False)

sample_col_bio = bio.columns[0]
# The second/third Shannon fields are Darwin/Physat; the first miTAG Shannon is the 13th field.
target_col = bio.columns[14]  # PANGAEA parameter 15: miTAG/SILVA Shannon

with zipfile.ZipFile(ENV_ZIP) as z:
    name = 'datasets/TARA_ENV_DEPTH_SENSORS.tab'
    with z.open(name) as f:
        header = None
        for i, raw in enumerate(f):
            if raw.decode('utf-8', errors='ignore').startswith('Sample ID'):
                header = i
                break
    with z.open(name) as f:
        env = pd.read_csv(f, sep='\t', skiprows=header, low_memory=False)

sample_col_env = env.columns[0]

def find_col(prefix, contains):
    cols = [c for c in env.columns if c.startswith(prefix) and contains in c]
    if not cols:
        raise RuntimeError(f'Missing {prefix} {contains}')
    return cols[0]

temp_col = find_col('Temp [°C]', 'median')
sal_col = find_col('Sal (', 'median')
o2_col = find_col('O2 [µmol/kg]', 'median')

selected = env[[
    sample_col_env, 'Date/Time', 'Latitude', 'Longitude',
    'Depth nominal (from which this sample was co...)',
    temp_col, sal_col, o2_col
]].copy()
selected.columns = ['sample_id','timestamp','latitude','longitude','depth_raw','temperature_c','salinity_psu','oxygen_umol_kg']

bio_selected = bio[[sample_col_bio, target_col]].copy()
bio_selected.columns = ['sample_id','shannon_diversity']

merged = selected.merge(bio_selected, on='sample_id', how='inner')

# Convert numeric fields.
for c in ['latitude','longitude','temperature_c','salinity_psu','oxygen_umol_kg','shannon_diversity']:
    merged[c] = pd.to_numeric(merged[c], errors='coerce')

# Convert depth ranges such as "0-500" to their midpoint; single values remain unchanged.
def depth_mid(value):
    if pd.isna(value):
        return None
    nums = re.findall(r'-?\d+(?:\.\d+)?', str(value))
    if not nums:
        return None
    vals = [float(x) for x in nums]
    return sum(vals) / len(vals)

merged['depth_m'] = merged['depth_raw'].map(depth_mid)
merged['timestamp'] = pd.to_datetime(merged['timestamp'], errors='coerce', utc=True)

cols = ['sample_id','timestamp','latitude','longitude','depth_m','temperature_c','salinity_psu','oxygen_umol_kg','shannon_diversity']
merged = merged[cols].dropna().drop_duplicates('sample_id')

# Basic physical sanity checks.
merged = merged[
    merged['latitude'].between(-90, 90)
    & merged['longitude'].between(-180, 180)
    & merged['depth_m'].between(0, 12000)
    & merged['temperature_c'].between(-5, 45)
    & merged['salinity_psu'].between(0, 45)
    & merged['oxygen_umol_kg'].between(0, 500)
    & (merged['shannon_diversity'] >= 0)
]

merged.to_csv(OUT, index=False)
print(f'Wrote {len(merged):,} real Tara training rows to {OUT}')
print(merged.describe(numeric_only=True).round(3).to_string())
