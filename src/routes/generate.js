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
exports.generateRouter = void 0;
const express_1 = require("express");
const router = (0, express_1.Router)();
const generateCV = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { jobDescription, cvData } = req.body;
        // Ici, nous allons migrer la logique de génération du CV
        // depuis le projet frontend
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error in generate route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/', generateCV);
exports.generateRouter = router;
