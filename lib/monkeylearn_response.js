function MonkeylearnResponse(classifier) {
    this.raw_response = "";
    this.resolution_code = this.UNRESOLVED;
}

MonkeylearnResponse.prototype.UNRESOLVED = 1;
MonkeylearnResponse.prototype.RESOLVED = 2;
MonkeylearnResponse.prototype.REJECTED = 3;

MonkeylearnResponse.prototype.data = function(some_data) {
    this.raw_response += some_data;
};

MonkeylearnResponse.prototype.complete = function() {
    try {
        this.response_data = JSON.parse(this.raw_response);

        if (this.response_data.status_code >= 400) {
            throw {
                message: JSON.stringify(this.response_data.detail),
                error: this.response_data.status_code
            };
        } else {
            this.resolution_code = this.RESOLVED;
        }
        return null;
    } catch (err) {
        this.resolution_code = this.REJECTED;
        this.error_thrown = err;
        return err;
    }
}

MonkeylearnResponse.prototype.error = function() {
    return this.error_thrown;
}

MonkeylearnResponse.prototype.unresolved = function() {
    return !this.resolved() && !this.rejected();
}

MonkeylearnResponse.prototype.resolved = function() {
    return this.resolution_code == this.RESOLVED;
}

MonkeylearnResponse.prototype.rejected = function() {
    return this.resolution_code == this.REJECTED;
}

MonkeylearnResponse.prototype.results = function() {
    if (this.response_data && this.response_data.result) {
        return this.response_data.result;
    }
    return {};
}

module.exports = MonkeylearnResponse;
