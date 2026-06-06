from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException


class AppError(Exception):
    """Error de dominio con código HTTP asociado."""

    def __init__(self, message: str, status_code: int = 400) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class NotFoundError(AppError):
    def __init__(self, message: str = "Recurso no encontrado") -> None:
        super().__init__(message, status.HTTP_404_NOT_FOUND)


def _envelope(message: str, status_code: int) -> JSONResponse:
    """Forma de error consistente que mapea al ApiError(message, status) del frontend."""
    return JSONResponse(
        status_code=status_code,
        content={"error": {"message": message, "status": status_code}},
    )


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def _handle_app_error(_request: Request, exc: AppError) -> JSONResponse:
        return _envelope(exc.message, exc.status_code)

    @app.exception_handler(StarletteHTTPException)
    async def _handle_http_error(_request: Request, exc: StarletteHTTPException) -> JSONResponse:
        message = exc.detail if isinstance(exc.detail, str) else "Error HTTP"
        return _envelope(message, exc.status_code)

    @app.exception_handler(RequestValidationError)
    async def _handle_validation_error(
        _request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        return _envelope("Datos de entrada inválidos", status.HTTP_422_UNPROCESSABLE_CONTENT)
