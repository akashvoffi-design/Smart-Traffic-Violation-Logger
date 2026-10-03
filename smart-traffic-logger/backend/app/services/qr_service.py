"""
QR code generation service.
Builds the public URL and returns a PNG byte stream.
"""
import io
import qrcode
from qrcode.image.pure import PyPNGImage
from flask import current_app


def generate_qr_png(public_token: str) -> bytes:
    """
    Generate a QR code PNG for the given public token.
    Returns raw PNG bytes.
    """
    base_url = current_app.config.get("PUBLIC_BASE_URL", "http://localhost:5173")
    url = f"{base_url}/c/{public_token}"

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    return buffer.getvalue()
