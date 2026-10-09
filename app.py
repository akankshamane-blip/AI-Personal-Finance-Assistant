import os
from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)


# ==============================
# MYSQL DATABASE CONNECTION
# ==============================
def get_db_connection():
    connection = mysql.connector.connect(
        host="localhost",
        user="root",
        password=os.getenv("DB_PASSWORD"),
        database="finmate_db"
    )
    return connection


# ==============================
# HOME
# ==============================
@app.route("/")
def home():
    return jsonify({
        "message": "FinMate AI Backend is running!"
    })


# ==============================
# DATABASE TEST
# ==============================
@app.route("/api/test")
def test():
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("SELECT DATABASE();")
        database = cursor.fetchone()

        cursor.close()
        connection.close()

        return jsonify({
            "status": "success",
            "message": "Flask connected to MySQL successfully!",
            "database": database[0]
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        })


# ==============================
# USER REGISTRATION
# ==============================
@app.route("/api/register", methods=["POST"])
def register():

    try:
        data = request.get_json()

        name = data.get("name")
        email = data.get("email")
        password = data.get("password")

        if not name or not email or not password:
            return jsonify({
                "status": "error",
                "message": "All fields are required."
            }), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            "SELECT user_id FROM users WHERE email = %s",
            (email,)
        )

        existing_user = cursor.fetchone()

        if existing_user:
            cursor.close()
            connection.close()

            return jsonify({
                "status": "error",
                "message": "Email already registered."
            }), 409

        hashed_password = generate_password_hash(password)

        cursor.execute(
            """
            INSERT INTO users (name, email, password)
            VALUES (%s, %s, %s)
            """,
            (name, email, hashed_password)
        )

        connection.commit()

        cursor.close()
        connection.close()

        return jsonify({
            "status": "success",
            "message": "Registration successful!"
        }), 201

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# ==============================
# USER LOGIN
# ==============================
@app.route("/api/login", methods=["POST"])
def login():

    try:
        data = request.get_json()

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({
                "status": "error",
                "message": "Email and password are required."
            }), 400

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT user_id, name, email, password
            FROM users
            WHERE email = %s
            """,
            (email,)
        )

        user = cursor.fetchone()

        cursor.close()
        connection.close()

        if not user:
            return jsonify({
                "status": "error",
                "message": "Invalid email or password."
            }), 401

        if not check_password_hash(user["password"], password):
            return jsonify({
                "status": "error",
                "message": "Invalid email or password."
            }), 401

        return jsonify({
            "status": "success",
            "message": "Login successful!",
            "user": {
                "user_id": user["user_id"],
                "name": user["name"],
                "email": user["email"]
            }
        }), 200

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# ==============================
# ADD INCOME
# ==============================
@app.route("/api/income", methods=["POST"])
def add_income():

    try:
        data = request.get_json()

        user_id = data.get("user_id")
        category_id = data.get("category_id")
        amount = data.get("amount")
        income_date = data.get("income_date")
        description = data.get("description")

        if not user_id or not amount or not income_date:
            return jsonify({
                "status": "error",
                "message": "User ID, amount and date are required."
            }), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            INSERT INTO income
            (user_id, category_id, amount, income_date, description)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (
                user_id,
                category_id,
                amount,
                income_date,
                description
            )
        )

        connection.commit()

        cursor.close()
        connection.close()

        return jsonify({
            "status": "success",
            "message": "Income added successfully!"
        }), 201

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# ==============================
# ADD EXPENSE
# ==============================
@app.route("/api/expense", methods=["POST"])
def add_expense():

    try:
        data = request.get_json()

        user_id = data.get("user_id")
        category_id = data.get("category_id")
        amount = data.get("amount")
        expense_date = data.get("expense_date")
        description = data.get("description")

        if not user_id or not amount or not expense_date:
            return jsonify({
                "status": "error",
                "message": "User ID, amount and date are required."
            }), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            INSERT INTO expenses
            (user_id, category_id, amount, expense_date, description)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (
                user_id,
                category_id,
                amount,
                expense_date,
                description
            )
        )

        connection.commit()

        cursor.close()
        connection.close()

        return jsonify({
            "status": "success",
            "message": "Expense added successfully!"
        }), 201

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# ==============================
# GET USER INCOME
# ==============================
@app.route("/api/income/<int:user_id>", methods=["GET"])
def get_income(user_id):

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT income_id, category_id, amount,
                   income_date, description
            FROM income
            WHERE user_id = %s
            ORDER BY income_date DESC
            """,
            (user_id,)
        )

        income = cursor.fetchall()

        cursor.close()
        connection.close()

        return jsonify({
            "status": "success",
            "income": income
        })

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# ==============================
# GET USER EXPENSES
# ==============================
@app.route("/api/expenses/<int:user_id>", methods=["GET"])
def get_expenses(user_id):

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT expense_id, category_id, amount,
                   expense_date, description
            FROM expenses
            WHERE user_id = %s
            ORDER BY expense_date DESC
            """,
            (user_id,)
        )

        expenses = cursor.fetchall()

        cursor.close()
        connection.close()

        return jsonify({
            "status": "success",
            "expenses": expenses
        })

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# ==============================
# ADD BUDGET
# ==============================
@app.route("/api/budget", methods=["POST"])
def add_budget():

    try:
        data = request.get_json()

        user_id = data.get("user_id")
        amount = data.get("amount")
        month_year = data.get("month_year")

        if not user_id or not amount or not month_year:
            return jsonify({
                "status": "error",
                "message": "User ID, amount and month/year are required."
            }), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            INSERT INTO budgets
            (user_id, amount, month_year)
            VALUES (%s, %s, %s)
            """,
            (user_id, amount, month_year)
        )

        connection.commit()

        cursor.close()
        connection.close()

        return jsonify({
            "status": "success",
            "message": "Budget added successfully!"
        }), 201

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# ==============================
# START FLASK SERVER
# ==============================
if __name__ == "__main__":
    app.run(debug=True)