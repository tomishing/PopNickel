from app.schemas.receipt import ParsedReceipt


async def parse_receipt_items(raw_ocr_text: str) -> ParsedReceipt:
    """Send OCR text to Claude API and return structured receipt data."""
    raise NotImplementedError
