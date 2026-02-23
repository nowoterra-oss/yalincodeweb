import { AppConfig, api } from '@config/ceoelevator-config';
import { ApiService } from '@services/ApiService';

const BASE = AppConfig.CeoElevatorUrl;

// --- Enums ---

export enum PricingType {
  BOM = 0,
  SupplierPrice = 1,
}

export const PricingTypeLabels: Record<PricingType, string> = {
  [PricingType.BOM]: 'BOM',
  [PricingType.SupplierPrice]: 'Tedarikci Fiyati',
};

// --- Lookup Types ---

export interface LookupValue {
  id: string;
  category: string;
  code: string;
  name: string;
  description: string | null;
  color: string | null;
  sortOrder: number;
  isSystem: boolean;
  isActive: boolean;
}

export interface LookupCreateRequest {
  category: string;
  code: string;
  name: string;
  description?: string;
  color?: string;
  sortOrder: number;
}

export interface LookupUpdateRequest {
  id: string;
  code: string;
  name: string;
  description?: string;
  color?: string;
  sortOrder: number;
  isActive: boolean;
}

// --- Common Types ---

interface XSorting {
  field?: string;
  order?: string;
}

interface XFilterItem {
  field?: string;
  value?: string;
  operator?: string;
}

interface XPageRequest {
  page?: number;
  pageSize?: number;
}

interface ListRequest {
  sorting?: XSorting;
  filters?: XFilterItem[];
  pageRequest?: XPageRequest;
}

// --- ProductGroup Types ---

export interface ProductGroupListItem {
  id: string;
  code: string;
  name: string;
  icon: string | null;
  pricingType: PricingType;
  defaultProfitMargin: number;
  sortOrder: number;
  isSystemGroup: boolean;
  isActive: boolean;
  productCount: number;
  createdAt: string;
}

export interface ProductGroupDetail {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  pricingType: PricingType;
  defaultProfitMargin: number;
  sortOrder: number;
  isSystemGroup: boolean;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface ProductGroupCreateRequest {
  code: string;
  name: string;
  description?: string;
  icon?: string;
  pricingType: PricingType;
  defaultProfitMargin: number;
  sortOrder: number;
}

export interface ProductGroupUpdateRequest {
  id: string;
  code: string;
  name: string;
  description?: string;
  icon?: string;
  pricingType: PricingType;
  defaultProfitMargin: number;
  sortOrder: number;
  isActive: boolean;
}

// --- Material Types ---

export interface MaterialListItem {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  unitPrice: number;
  currency: string;
  supplier: string | null;
  isActive: boolean;
  priceUpdatedAt: string;
  createdAt: string;
}

export interface MaterialDetail {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: string;
  unit: string;
  unitPrice: number;
  currency: string;
  supplier: string | null;
  minOrderQuantity: number | null;
  leadTimeDays: number | null;
  priceUpdatedAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface MaterialCreateRequest {
  code: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  unitPrice: number;
  currency: string;
  supplier?: string;
  minOrderQuantity?: number;
  leadTimeDays?: number;
}

export interface MaterialUpdateRequest {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  unitPrice: number;
  currency: string;
  supplier?: string;
  minOrderQuantity?: number;
  leadTimeDays?: number;
  isActive: boolean;
}

// --- Product Types ---

export interface ProductListItem {
  id: string;
  code: string;
  name: string;
  productGroupId: string;
  productGroupName: string;
  isSubAssembly: boolean;
  variantCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface VariantDto {
  id: string;
  code: string;
  name: string;
  attributes: string;
  isDefault: boolean;
  isActive: boolean;
  calculatedCost: number | null;
  calculatedCurrency: string | null;
  costCalculatedAt: string | null;
}

export interface ProductDetail {
  id: string;
  code: string;
  name: string;
  description: string | null;
  productGroupId: string;
  productGroupName: string;
  attributes: string;
  isSubAssembly: boolean;
  sortOrder: number;
  isActive: boolean;
  variants: VariantDto[];
  createdAt: string;
  updatedAt: string | null;
}

export interface ProductCreateRequest {
  code: string;
  name: string;
  description?: string;
  productGroupId: string;
  attributes?: string;
  isSubAssembly: boolean;
  sortOrder: number;
}

export interface ProductUpdateRequest {
  id: string;
  code: string;
  name: string;
  description?: string;
  productGroupId: string;
  attributes?: string;
  isSubAssembly: boolean;
  sortOrder: number;
  isActive: boolean;
}

// --- ProductVariant Types ---

export interface ProductVariantCreateRequest {
  productId: string;
  code: string;
  name: string;
  attributes?: string;
  isDefault: boolean;
}

export interface ProductVariantUpdateRequest {
  id: string;
  code: string;
  name: string;
  attributes?: string;
  isDefault: boolean;
  isActive: boolean;
}

// --- API Functions ---

export const productGroupsApi = {
  getAll: (data?: ListRequest) =>
    ApiService.call<ProductGroupListItem[]>(api.post(`${BASE}/Pricing/ProductGroups/All`, data || {})),
  getDetail: (id: string) =>
    ApiService.call<ProductGroupDetail>(api.post(`${BASE}/Pricing/ProductGroups/Detail`, { id })),
  create: (data: ProductGroupCreateRequest) =>
    ApiService.call<{ id: string; code: string }>(api.post(`${BASE}/Pricing/ProductGroups/Create`, data)),
  update: (data: ProductGroupUpdateRequest) =>
    ApiService.call<{ id: string; code: string }>(api.post(`${BASE}/Pricing/ProductGroups/Update`, data)),
  delete: (id: string) =>
    ApiService.call<{ success: boolean }>(api.post(`${BASE}/Pricing/ProductGroups/Delete`, { id })),
};

export const materialsApi = {
  getAll: (data?: ListRequest) =>
    ApiService.call<MaterialListItem[]>(api.post(`${BASE}/Pricing/Materials/All`, data || {})),
  getDetail: (id: string) =>
    ApiService.call<MaterialDetail>(api.post(`${BASE}/Pricing/Materials/Detail`, { id })),
  create: (data: MaterialCreateRequest) =>
    ApiService.call<{ id: string; code: string }>(api.post(`${BASE}/Pricing/Materials/Create`, data)),
  update: (data: MaterialUpdateRequest) =>
    ApiService.call<{ id: string; code: string }>(api.post(`${BASE}/Pricing/Materials/Update`, data)),
  delete: (id: string) =>
    ApiService.call<{ success: boolean }>(api.post(`${BASE}/Pricing/Materials/Delete`, { id })),
};

export const productsApi = {
  getAll: (data?: ListRequest) =>
    ApiService.call<ProductListItem[]>(api.post(`${BASE}/Pricing/Products/All`, data || {})),
  getDetail: (id: string) =>
    ApiService.call<ProductDetail>(api.post(`${BASE}/Pricing/Products/Detail`, { id })),
  create: (data: ProductCreateRequest) =>
    ApiService.call<{ id: string; code: string }>(api.post(`${BASE}/Pricing/Products/Create`, data)),
  update: (data: ProductUpdateRequest) =>
    ApiService.call<{ id: string; code: string }>(api.post(`${BASE}/Pricing/Products/Update`, data)),
  delete: (id: string) =>
    ApiService.call<{ success: boolean }>(api.post(`${BASE}/Pricing/Products/Delete`, { id })),
};

export const productVariantsApi = {
  create: (data: ProductVariantCreateRequest) =>
    ApiService.call<{ id: string; code: string }>(api.post(`${BASE}/Pricing/ProductVariants/Create`, data)),
  update: (data: ProductVariantUpdateRequest) =>
    ApiService.call<{ id: string; code: string }>(api.post(`${BASE}/Pricing/ProductVariants/Update`, data)),
  delete: (id: string) =>
    ApiService.call<{ success: boolean }>(api.post(`${BASE}/Pricing/ProductVariants/Delete`, { id })),
};

export const lookupsApi = {
  getByCategory: (category: string) =>
    ApiService.call<LookupValue[]>(api.post(`${BASE}/Lookups/ByCategory`, { category })),
  create: (data: LookupCreateRequest) =>
    ApiService.call<{ id: string; code: string }>(api.post(`${BASE}/Lookups/Create`, data)),
  update: (data: LookupUpdateRequest) =>
    ApiService.call<{ id: string; code: string }>(api.post(`${BASE}/Lookups/Update`, data)),
  delete: (id: string) =>
    ApiService.call<{ success: boolean }>(api.post(`${BASE}/Lookups/Delete`, { id })),
};
