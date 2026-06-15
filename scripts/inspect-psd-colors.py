from psd_tools import PSDImage
import numpy as np

psd = PSDImage.open("tmp/Viral Architect Logo.psd")
for layer in psd:
    if not layer.visible:
        continue
    arr = np.array(layer.composite().convert("RGBA"))
    mask = arr[:, :, 3] > 0
    if not mask.any():
        continue
    rgb = arr[mask][:, :3]
    mean = rgb.mean(axis=0).astype(int)
    uniq = np.unique(rgb.reshape(-1, 3), axis=0)
    print(
        f"{layer.name!r}: mean={mean.tolist()} "
        f"unique_colors={len(uniq)} sample={uniq[:8].tolist()}"
    )
