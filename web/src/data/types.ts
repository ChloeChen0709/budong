export type Mode = "course" | "exam";

export interface Section {
  id: string;
  title: string;
  kw?: string[];
}

export interface Chapter {
  no: string;
  title: string;
  note?: string;
  sections: Section[];
}

export interface Entry {
  q: string;
  a?: string;
  analysis?: string;
}

export interface SectionNote {
  concepts?: string[];
  types?: string[];
  examples?: Entry[];
  plain?: boolean;
  typesStyle?: string;
}

export interface Pack {
  id: string;
  name: string;
  tagline?: string;
  mark?: string;
  mode?: Mode;
  labels?: Record<string, string>;
  book: { title?: string; chapters: Chapter[] };
  notes: Record<string, SectionNote>;
}

export interface SrsRecord {
  stage: number;
  seen: number;
  due: number;
  mastered?: boolean;
}

/** 一本书的本地状态。字段与旧版单文件一致，便于互相导入。 */
export interface BookState {
  bookId: string;
  notes: Record<string, SectionNote>;
  srs: Record<string, SrsRecord>;
  vocabDay: Record<string, number>;
  vocabGoal: number;
  contentVer?: string;
  updatedAt: number;
}
