"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class BaseController {
    constructor(model) {
        this.model = model;
    }
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const hasQuery = Object.keys(req.query || {}).length > 0;
                const data = hasQuery ? yield this.model.find(req.query) : yield this.model.find();
                res.json(data);
                return;
            }
            catch (err) {
                console.error(err);
                res.status(500).send("Error retrieving data");
                return;
            }
        });
    }
    getById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            try {
                const data = yield this.model.findById(id);
                if (!data) {
                    res.status(404).send("Not found");
                    return;
                }
                res.json(data);
                return;
            }
            catch (err) {
                console.error(err);
                res.status(500).send("Error retrieving by ID");
                return;
            }
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield this.model.create(req.body);
                res.status(201).json(data);
                return;
            }
            catch (err) {
                console.error(err);
                res.status(500).send("Error creating");
                return;
            }
        });
    }
    del(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            try {
                const deletedData = yield this.model.findByIdAndDelete(id);
                res.status(200).json(deletedData);
                return;
            }
            catch (err) {
                console.error(err);
                res.status(500).send("Error deleting");
                return;
            }
        });
    }
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            try {
                const data = yield this.model.findByIdAndUpdate(id, req.body, { new: true });
                res.json(data);
                return;
            }
            catch (err) {
                console.error(err);
                res.status(500).send("Error updating");
                return;
            }
        });
    }
}
exports.default = BaseController;
//# sourceMappingURL=baseController.js.map