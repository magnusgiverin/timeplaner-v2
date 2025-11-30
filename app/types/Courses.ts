export interface CourseData {
  id: string;
  create_activity_zoom?: boolean;
  authorized_netgroups?: string[];
  nofterms?: number;
  terminnr?: number;
  name?: string;
  fullname?: string;
  fullname_en?: string;
  fullname_nn?: string;
  idtermin?: string;
}

export interface ApiCourse {
  courseid: string;
  name?: string;
}
