from flask import request
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)

from app.services.chatbot_service import ChatbotService
from app.utils.response import (
    success_response,
    error_response
)


class ChatbotController:

    # ==========================================
    # Chat with AI
    # ==========================================

    @staticmethod
    @jwt_required()
    def chat():

        try:

            data = request.get_json()

            question = data.get("message")

            if not question:

                return error_response(
                    "Message is required.",
                    400
                )

            user_id = get_jwt_identity()

            result = ChatbotService.chat(
                user_id,
                question
            )

            return success_response(
                "AI response generated successfully.",
                result
            )

        except Exception as e:

            return error_response(
                str(e),
                500
            )

    # ==========================================
    # Reset Conversation
    # ==========================================

    @staticmethod
    @jwt_required()
    def reset():

        try:

            user_id = get_jwt_identity()

            from app.ai.ai_banking_assistant import (
                AIBankingAssistant
            )

            AIBankingAssistant.reset_chat(
                user_id
            )

            return success_response(
                "Conversation reset successfully."
            )

        except Exception as e:

            return error_response(
                str(e),
                500
            )

    # ==========================================
    # Health Check
    # ==========================================

    @staticmethod
    def health():

        from app.ai.ai_banking_assistant import (
            AIBankingAssistant
        )

        return success_response(
            "AI Service Running",
            AIBankingAssistant.health()
        )