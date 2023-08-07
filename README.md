```shell
# Run
pip install -r requirements.txt
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8080

# Build
docker buildx build --platform linux/amd64 -t draught-it .

# Run in docker
docker run -p 8080:8080 draught-it

# Push
docker tag draught-it rg.fr-par.scw.cloud/funcscwdraughtitzv3uetb6/draught-it:latest
docker login rg.fr-par.scw.cloud/funcscwdraughtitzv3uetb6 -u nologin --password-stdin <<< "$SCW_SECRET_KEY"
docker push rg.fr-par.scw.cloud/funcscwdraughtitzv3uetb6/draught-it:latest
```