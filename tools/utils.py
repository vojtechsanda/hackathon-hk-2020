import requests
from tqdm import tqdm

def download_from_url(url, dst, req=None):
    if req is None:
        req = requests.get(url, stream=True)
    file_size = int(req.headers['Content-Length'].strip())
    pbar = tqdm(
        total=file_size, initial=0,
        unit='B', unit_scale=True, desc=url.split('/')[-1])
    with(open(dst, 'wb')) as f:
        for chunk in req.iter_content(chunk_size=1024):
            if chunk:
                f.write(chunk)
                pbar.update(1024)
    pbar.close()
