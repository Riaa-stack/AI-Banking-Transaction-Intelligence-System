import random


class OCRProcessor:

    @staticmethod
    def process(statement):

        """
        OCR Processing Module

        Currently returns placeholder data.

        Replace this implementation with
        EasyOCR / Tesseract / Google Vision
        when integrating a real OCR engine.
        """

        extracted_text = (
            "Bank Statement processed successfully."
        )

        transaction_count = random.randint(5, 25)

        confidence = round(
            random.uniform(95.0, 99.5),
            2
        )

        summary = (
            f"{transaction_count} transactions "
            f"were detected from the uploaded statement."
        )

        return {

            "text": extracted_text,

            "confidence": confidence,

            "transaction_count": transaction_count,

            "summary": summary

        }