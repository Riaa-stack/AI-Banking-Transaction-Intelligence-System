from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models.user import User
from app.schemas.account_schema import BankAccountSchema
from app.services.account_service import AccountService
from app.utils.response import success_response, error_response


account_schema = BankAccountSchema()


class AccountController:

    @staticmethod
    @jwt_required()
    def add_account():

        user = User.query.get(get_jwt_identity())

        json_data = request.get_json()

        errors = account_schema.validate(json_data)

        if errors:
            return error_response(errors)

        success, result = AccountService.create_account(
            user,
            json_data
        )

        if not success:
            return error_response(result)

        return success_response(
            "Bank account added successfully.",
            {
                "account_id": str(result.id),
                "account_number": result.account_number
            },
            201
        )

    @staticmethod
    @jwt_required()
    def get_all_accounts():

        user = User.query.get(get_jwt_identity())

        success, result = AccountService.get_all_accounts(user)

        if not success:
            return error_response(result)

        accounts = []

        for account in result:

            accounts.append({
                "id": str(account.id),
                "bank_name": account.bank_name,
                "account_holder_name": account.account_holder_name,
                "account_number": account.account_number,
                "ifsc_code": account.ifsc_code,
                "branch_name": account.branch_name,
                "account_type": account.account_type.value,
                "current_balance": float(account.current_balance),
                "is_primary": account.is_primary,
                "account_status": account.account_status.value
            })

        return success_response(
            "Accounts fetched successfully.",
            accounts
        )

    @staticmethod
    @jwt_required()
    def get_account(account_id):

        success, result = AccountService.get_account_by_id(account_id)

        if not success:
            return error_response(result, 404)

        return success_response(
            "Account fetched successfully.",
            {
                "id": str(result.id),
                "bank_name": result.bank_name,
                "account_holder_name": result.account_holder_name,
                "account_number": result.account_number,
                "ifsc_code": result.ifsc_code,
                "branch_name": result.branch_name,
                "account_type": result.account_type.value,
                "current_balance": float(result.current_balance),
                "is_primary": result.is_primary,
                "account_status": result.account_status.value
            }
        )

    @staticmethod
    @jwt_required()
    def delete_account(account_id):

        success, account = AccountService.get_account_by_id(account_id)

        if not success:
            return error_response(account, 404)

        success, result = AccountService.delete_account(account)

        if not success:
            return error_response(result)

        return success_response(result)