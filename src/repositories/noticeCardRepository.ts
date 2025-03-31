import {AppDataSource} from "../config/database";
import {NoticeCard} from "../models/NoticeCard";

export const noticeCardRepository = AppDataSource.getRepository(NoticeCard);