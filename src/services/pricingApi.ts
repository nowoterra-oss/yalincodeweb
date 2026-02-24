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

// --- BomLine Types ---

export interface BomLineListItem {
  id: string;
  productVariantId: string;
  materialId: string | null;
  materialName: string | null;
  materialCode: string | null;
  materialUnit: string | null;
  materialUnitPrice: number | null;
  materialCurrency: string | null;
  childProductVariantId: string | null;
  childProductVariantName: string | null;
  label: string | null;
  quantity: number;
  unit: string | null;
  unitPriceOverride: number | null;
  currencyOverride: string | null;
  wastePercent: number | null;
  notes: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface BomLineCreateRequest {
  productVariantId: string;
  materialId?: string;
  childProductVariantId?: string;
  label?: string;
  quantity: number;
  unit?: string;
  unitPriceOverride?: number;
  currencyOverride?: string;
  wastePercent?: number;
  notes?: string;
  sortOrder: number;
}

export interface BomLineUpdateRequest {
  id: string;
  materialId?: string;
  childProductVariantId?: string;
  label?: string;
  quantity: number;
  unit?: string;
  unitPriceOverride?: number;
  currencyOverride?: string;
  wastePercent?: number;
  notes?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface CostBreakdownItem {
  bomLineId: string;
  label: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  currency: string;
  wastePercent: number;
  lineCost: number;
  isChildAssembly: boolean;
}

export interface CostCalculationResult {
  totalCost: number;
  currency: string;
  breakdown: CostBreakdownItem[];
}

// --- SupplierPrice Types ---

export interface SupplierPriceListItem {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  brand: string | null;
  supplierName: string | null;
  price: number;
  currency: string;
  discountRate: number;
  conditions: string | null;
  effectiveFrom: string;
  effectiveTo: string | null;
  priceUpdatedAt: string;
  isActive: boolean;
  createdAt: string;
}

export interface SupplierPriceCreateRequest {
  productId: string;
  brand?: string;
  supplierName?: string;
  price: number;
  currency: string;
  discountRate: number;
  conditions?: string;
  effectiveFrom: string;
  effectiveTo?: string;
}

export interface SupplierPriceUpdateRequest {
  id: string;
  productId: string;
  brand?: string;
  supplierName?: string;
  price: number;
  currency: string;
  discountRate: number;
  conditions?: string;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
}

// --- PriceRule Types ---

export enum PriceRuleType {
  Discount = 0,
  Markup = 1,
  Override = 2,
}

export interface PriceRuleListItem {
  id: string;
  productGroupId: string | null;
  productGroupName: string | null;
  name: string;
  ruleType: number;
  matchCondition: string;
  values: string;
  variantField: string | null;
  priority: number;
  isActive: boolean;
  createdAt: string;
}

export interface PriceRuleCreateRequest {
  productGroupId?: string;
  name: string;
  ruleType: number;
  matchCondition: string;
  values: string;
  variantField?: string;
  priority: number;
}

export interface PriceRuleUpdateRequest {
  id: string;
  productGroupId?: string;
  name: string;
  ruleType: number;
  matchCondition: string;
  values: string;
  variantField?: string;
  priority: number;
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
    ApiService.call<ProductGroupListItem[]>(api.post(`${BASE}/ProductGroups/All`, data || {})),
  getDetail: (id: string) =>
    ApiService.call<ProductGroupDetail>(api.post(`${BASE}/ProductGroups/Detail`, { id })),
  create: (data: ProductGroupCreateRequest) =>
    ApiService.call<{ id: string; code: string }>(api.post(`${BASE}/ProductGroups/Create`, data)),
  update: (data: ProductGroupUpdateRequest) =>
    ApiService.call<{ id: string; code: string }>(api.post(`${BASE}/ProductGroups/Update`, data)),
  delete: (id: string) =>
    ApiService.call<{ success: boolean }>(api.post(`${BASE}/ProductGroups/Delete`, { id })),
};

export const materialsApi = {
  getAll: (data?: ListRequest) =>
    ApiService.call<MaterialListItem[]>(api.post(`${BASE}/Materials/All`, data || {})),
  getDetail: (id: string) =>
    ApiService.call<MaterialDetail>(api.post(`${BASE}/Materials/Detail`, { id })),
  create: (data: MaterialCreateRequest) =>
    ApiService.call<{ id: string; code: string }>(api.post(`${BASE}/Materials/Create`, data)),
  update: (data: MaterialUpdateRequest) =>
    ApiService.call<{ id: string; code: string }>(api.post(`${BASE}/Materials/Update`, data)),
  delete: (id: string) =>
    ApiService.call<{ success: boolean }>(api.post(`${BASE}/Materials/Delete`, { id })),
};

export const productsApi = {
  getAll: (data?: ListRequest) =>
    ApiService.call<ProductListItem[]>(api.post(`${BASE}/Products/All`, data || {})),
  getDetail: (id: string) =>
    ApiService.call<ProductDetail>(api.post(`${BASE}/Products/Detail`, { id })),
  create: (data: ProductCreateRequest) =>
    ApiService.call<{ id: string; code: string }>(api.post(`${BASE}/Products/Create`, data)),
  update: (data: ProductUpdateRequest) =>
    ApiService.call<{ id: string; code: string }>(api.post(`${BASE}/Products/Update`, data)),
  delete: (id: string) =>
    ApiService.call<{ success: boolean }>(api.post(`${BASE}/Products/Delete`, { id })),
};

export const productVariantsApi = {
  create: (data: ProductVariantCreateRequest) =>
    ApiService.call<{ id: string; code: string }>(api.post(`${BASE}/ProductVariants/Create`, data)),
  update: (data: ProductVariantUpdateRequest) =>
    ApiService.call<{ id: string; code: string }>(api.post(`${BASE}/ProductVariants/Update`, data)),
  delete: (id: string) =>
    ApiService.call<{ success: boolean }>(api.post(`${BASE}/ProductVariants/Delete`, { id })),
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

export const bomLinesApi = {
  getAll: (data: { productVariantId: string } & Partial<ListRequest>) =>
    ApiService.call<BomLineListItem[]>(api.post(`${BASE}/BomLines/All`, data)),
  create: (data: BomLineCreateRequest) =>
    ApiService.call<{ id: string; sortOrder: number }>(api.post(`${BASE}/BomLines/Create`, data)),
  update: (data: BomLineUpdateRequest) =>
    ApiService.call<{ id: string; sortOrder: number }>(api.post(`${BASE}/BomLines/Update`, data)),
  delete: (id: string) =>
    ApiService.call<{ success: boolean }>(api.post(`${BASE}/BomLines/Delete`, { id })),
  calculateCost: (productVariantId: string) =>
    ApiService.call<CostCalculationResult>(api.post(`${BASE}/BomLines/CalculateCost`, { productVariantId })),
};

export const supplierPricesApi = {
  getAll: (data?: { productId?: string } & Partial<ListRequest>) =>
    ApiService.call<SupplierPriceListItem[]>(api.post(`${BASE}/SupplierPrices/All`, data || {})),
  create: (data: SupplierPriceCreateRequest) =>
    ApiService.call<{ id: string }>(api.post(`${BASE}/SupplierPrices/Create`, data)),
  update: (data: SupplierPriceUpdateRequest) =>
    ApiService.call<{ id: string }>(api.post(`${BASE}/SupplierPrices/Update`, data)),
  delete: (id: string) =>
    ApiService.call<{ success: boolean }>(api.post(`${BASE}/SupplierPrices/Delete`, { id })),
};

export const priceRulesApi = {
  getAll: (data?: { productGroupId?: string } & Partial<ListRequest>) =>
    ApiService.call<PriceRuleListItem[]>(api.post(`${BASE}/PriceRules/All`, data || {})),
  create: (data: PriceRuleCreateRequest) =>
    ApiService.call<{ id: string; name: string }>(api.post(`${BASE}/PriceRules/Create`, data)),
  update: (data: PriceRuleUpdateRequest) =>
    ApiService.call<{ id: string; name: string }>(api.post(`${BASE}/PriceRules/Update`, data)),
  delete: (id: string) =>
    ApiService.call<{ success: boolean }>(api.post(`${BASE}/PriceRules/Delete`, { id })),
};

// --- Configurator Types ---

export interface ConfiguratorOptions {
  motorBrands: string[];
  capacities: number[];
  speeds: number[];
  pulleyDiameters: number[];
  ropeBrands: string[];
  ropeDiameters: number[];
  regulatorBrands: string[];
  panelBrands: string[];
  doorBrands: string[];
  doorWidths: number[];
  doorHeights: number[];
  doorCoatings: string[];
  railBrands: string[];
  railSizes: string[];
  priceListCategories: Record<string, { itemName: string; salesPrice: number; purchasePriceEUR: number }[]>;
  brandDiscounts: { brand: string; category: number; discountRateMR: number; discountRateMRL: number; discountRateGeneral: number }[];
  machinePlatformCapacities: number[];
  exchangeRates: { currencyCode: string; buyRate: number; sellRate: number; crossRate: number | null }[];
  defaultProfitMargin: number;
}

export interface QuotationBreakdownItem {
  category: string;
  itemName: string;
  quantity: number;
  unit: string;
  basePrice: number;
  currency: string;
  discountRate: number;
  profitMargin: number;
  unitPrice: number;
  totalPrice: number;
  totalPriceUSD: number;
}

export interface CalculateQuotationResponse {
  breakdown: QuotationBreakdownItem[];
  subtotalUSD: number;
  totalUSD: number;
  totalTL: number;
  totalEUR: number;
  exchangeRateUSD: number;
  exchangeRateEUR: number;
  profitMargin: number;
}

export interface CalculateQuotationRequest {
  motorBrand?: string;
  capacity?: number;
  speed?: number;
  motorType?: number;
  suspensionType?: number;
  ropeBrand?: string;
  ropeDiameter?: number;
  ropeCount?: number;
  regulatorBrand?: string;
  panelBrand?: string;
  installationType?: number;
  doorBrand?: string;
  doorWidth?: number;
  doorHeight?: number;
  doorOpeningType?: number;
  doorCoating?: string;
  doorPanelCount?: number;
  cabinDoorBrand?: string;
  railBrand?: string;
  railSize?: string;
  counterweightRailBrand?: string;
  counterweightRailSize?: string;
  stopCount?: number;
  floorHeight?: number;
  lastFloorHeight?: number;
  pitDepth?: number;
  shaftLength?: number;
  entranceCount?: number;
}

export interface SeedDataResponse {
  motorPricesInserted: number;
  controlPanelPricesInserted: number;
  doorPricesInserted: number;
  ropePricesInserted: number;
  railPricesInserted: number;
  regulatorPricesInserted: number;
  brandDiscountsInserted: number;
  machinePlatformPricesInserted: number;
  profitMarginSettingsInserted: number;
  tcmbExchangeRatesInserted: number;
  priceListItemsInserted: number;
  translationsInserted: number;
  totalInserted: number;
  warnings: string[];
}

// --- Configurator API ---

export const configuratorApi = {
  getOptions: () =>
    ApiService.call<ConfiguratorOptions>(api.post(`${BASE}/Configurator/Options`, {})),
  calculate: (data: CalculateQuotationRequest) =>
    ApiService.call<CalculateQuotationResponse>(api.post(`${BASE}/Configurator/Calculate`, data)),
  seedData: (data?: { overwrite?: boolean; seedType?: string }) =>
    ApiService.call<SeedDataResponse>(api.post(`${BASE}/Configurator/SeedData`, data || {})),
};
