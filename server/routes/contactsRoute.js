import { Router } from "express";
import {
  getAllContacts,
  getContactsForDM,
  searchContacts,
} from "../controllers/contactsController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const contactsRoutes = Router();

contactsRoutes.post("/search", verifyToken, searchContacts);
contactsRoutes.get("/get-contacts-for-dm", verifyToken, getContactsForDM);
contactsRoutes.get("/get-all-contacts", verifyToken, getAllContacts);

export default contactsRoutes;
