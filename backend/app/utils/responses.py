from flask import jsonify


def success_response(data=None, message=None, status_code=200):
    resp = {"success": True}
    if message:
        resp["message"] = message
    if data is not None:
        resp["data"] = data
    return jsonify(resp), status_code


def error_response(message, status_code=400, errors=None):
    resp = {"success": False, "error": message}
    if errors:
        resp["errors"] = errors
    return jsonify(resp), status_code


def paginated_response(items, total, page, per_page):
    return jsonify({
        "success": True,
        "data": items,
        "pagination": {
            "total": total,
            "page": page,
            "per_page": per_page,
            "pages": (total + per_page - 1) // per_page,
        },
    })
