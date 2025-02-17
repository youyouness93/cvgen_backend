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
exports.analyzeRouter = void 0;
const express_1 = require("express");
const cv_service_1 = require("../services/cv.service");
const router = (0, express_1.Router)();
const createCV = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cvData, jobData } = req.body;
        if (!cvData || !jobData) {
            res.status(400).json({ error: 'CV et description du poste requis' });
            return;
        }
        const cvId = yield cv_service_1.CVService.createCV(cvData, jobData);
        res.json({ id: cvId });
    }
    catch (error) {
        console.error('Error in analyze route:', error);
        res.status(500).json({ error: (error === null || error === void 0 ? void 0 : error.message) || 'Internal server error' });
    }
});
const getCV = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const cv = yield cv_service_1.CVService.getCV(id);
        res.json(cv);
    }
    catch (error) {
        console.error('Error fetching CV:', error);
        if (error.message === 'CV non trouvé') {
            res.status(404).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});
router.post('/', createCV);
router.get('/:id', getCV);
exports.analyzeRouter = router;
