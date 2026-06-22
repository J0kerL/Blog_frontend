// ========== Unified Result ==========
export interface ApiResult<T> {
  code: number;
  message: string;
  data: T;
}

export interface PageResult<T> {
  pageNum: number;
  pageSize: number;
  total: number;
  pages: number;
  list: T[];
}

// ========== Pagination & Search ==========
export interface PaginationParams {
  pageNum?: number;
  pageSize?: number;
}

export interface SearchParams extends PaginationParams {
  keyword?: string;
}

// ========== User ==========
export type UserRole = 'ROLE_USER' | 'ROLE_ADMIN';

export interface UserVO {
  id: number;
  username: string;
  nickname: string;
  email: string;
  avatar: string;
  bio: string;
  role: UserRole;
  createdAt: string;
}

export interface AdminUserVO {
  id: number;
  username: string;
  nickname: string;
  email: string;
  avatar: string;
  bio: string;
  role: UserRole;
  status: number;
  createdAt: string;
}

export interface LoginVO {
  token: string;
  tokenPrefix: string;
  user: UserVO;
}

export interface LoginDTO {
  username: string;
  password: string;
  captchaKey: string;
  captchaCode: string;
}

export interface RegisterDTO {
  username: string;
  password: string;
  confirmPassword: string;
  nickname?: string;
  email?: string;
}

export interface UserUpdateDTO {
  nickname?: string;
  email?: string;
  bio?: string;
}

export interface ChangePasswordDTO {
  oldPassword: string;
  newPassword: string;
}

export interface ForgotPasswordDTO {
  email: string;
  captchaKey: string;
  captchaCode: string;
  newPassword: string;
}

export interface CaptchaVO {
  captchaKey: string;
  captchaImage: string;
}

// ========== Post ==========
export interface PostListVO {
  id: number;
  title: string;
  slug: string;
  summary: string;
  coverImage: string;
  isTop: number;
  status: number;
  viewCount: number;
  publishedAt: string;
  author: UserVO;
  categories: CategoryVO[];
  tags: TagVO[];
}

export interface PostVO {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage: string;
  status: number;
  isTop: number;
  allowComment: number;
  viewCount: number;
  publishedAt: string;
  createdAt: string;
  author: UserVO;
  categories: CategoryVO[];
  tags: TagVO[];
}

export interface PostCreateDTO {
  title: string;
  slug?: string;
  summary?: string;
  content: string;
  coverImage?: string;
  status?: number;
  isTop?: number;
  allowComment?: number;
  scheduledAt?: string;
  categoryIds?: number[];
  tagIds?: number[];
  newCategoryNames?: string[];
  newTagNames?: string[];
}

// ========== Category ==========
export interface CategoryVO {
  id: number;
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
  postCount: number;
}

export interface CategoryDTO {
  name: string;
  slug?: string;
  description?: string;
  sortOrder?: number;
}

// ========== Tag ==========
export interface TagVO {
  id: number;
  name: string;
  slug: string;
  postCount: number;
}

export interface TagDTO {
  name: string;
  slug?: string;
}

// ========== Comment ==========
export interface CommentVO {
  id: number;
  postId: number;
  parentId: number | null;
  content: string;
  nickname: string;
  avatar: string;
  status?: number;
  postTitle?: string;
  createdAt: string;
  replies: CommentVO[];
}

export interface CommentCreateDTO {
  postId: number;
  parentId?: number;
  nickname?: string;
  content: string;
}
