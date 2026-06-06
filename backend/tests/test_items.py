from httpx import AsyncClient


async def test_items_crud(client: AsyncClient) -> None:
    # Crear
    res = await client.post("/api/v1/items", json={"title": "demo"})
    assert res.status_code == 201
    item = res.json()
    assert item["title"] == "demo"
    assert item["done"] is False
    item_id = item["id"]

    # Listar
    res = await client.get("/api/v1/items")
    assert res.status_code == 200
    assert any(i["id"] == item_id for i in res.json())

    # Obtener
    res = await client.get(f"/api/v1/items/{item_id}")
    assert res.status_code == 200

    # Actualizar (parcial)
    res = await client.put(f"/api/v1/items/{item_id}", json={"done": True})
    assert res.status_code == 200
    assert res.json()["done"] is True

    # Eliminar
    res = await client.delete(f"/api/v1/items/{item_id}")
    assert res.status_code == 204


async def test_get_missing_item_returns_404(client: AsyncClient) -> None:
    res = await client.get("/api/v1/items/no-existe")
    assert res.status_code == 404
    assert res.json()["error"]["status"] == 404


async def test_create_item_validation_error(client: AsyncClient) -> None:
    res = await client.post("/api/v1/items", json={"title": ""})
    assert res.status_code == 422
    assert res.json()["error"]["status"] == 422
