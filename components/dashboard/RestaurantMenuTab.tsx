"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ImageUpload from "@/components/ImageUpload";
import { apiClient } from "@/lib/apiClient";

interface MenuCategory {
  id: number;
  restaurant_id: number;
  name: string;
  sort_order: number;
}

interface AddonOptionState {
  name: string;
  price: string;
}

interface AddonGroupState {
  title: string;
  options: AddonOptionState[];
}

interface MenuItem {
  id: number;
  category_id?: number;
  name: string;
  description?: string;
  image_url?: string;
  base_price: number;
  is_available: boolean;
  sort_order?: number;
  addon_groups?: {
    id?: number;
    name?: string;
    title?: string;
    options?: { id?: number; name: string; extra_price?: number; price?: number }[];
  }[];
  related_item_ids?: number[];
}

interface RestaurantMenuTabProps {
  isShop?: boolean;
}

export default function RestaurantMenuTab({ isShop = false }: RestaurantMenuTabProps) {
  const queryClient = useQueryClient();

  // Category Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [categoryName, setCategoryName] = useState("");

  // Menu Item Modal State
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemName, setItemName] = useState("");
  const [itemCategoryId, setItemCategoryId] = useState<number | "">("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemImageUrl, setItemImageUrl] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemIsAvailable, setItemIsAvailable] = useState(true);

  // Add-ons & Frequently Bought Together Builder State
  const [itemAddonGroups, setItemAddonGroups] = useState<AddonGroupState[]>([
    { title: "ADD-ONS", options: [{ name: "Cheese Slice", price: "50" }] },
  ]);
  const [itemRelatedIds, setItemRelatedIds] = useState<number[]>([]);

  const [selectedCatFilter, setSelectedCatFilter] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Queries
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<MenuCategory[]>({
    queryKey: ["owner-categories"],
    queryFn: () => apiClient.get<MenuCategory[]>("/restaurant-owner/menu-categories"),
  });

  const { data: menuItems = [], isLoading: itemsLoading } = useQuery<MenuItem[]>({
    queryKey: ["owner-items", selectedCatFilter],
    queryFn: () =>
      apiClient.get<MenuItem[]>(
        selectedCatFilter
          ? `/restaurant-owner/menu-items?category_id=${selectedCatFilter}`
          : "/restaurant-owner/menu-items"
      ),
  });

  // Category Mutations
  const saveCategoryMutation = useMutation({
    mutationFn: async () => {
      if (editingCategory) {
        return apiClient.patch(`/restaurant-owner/menu-categories/${editingCategory.id}`, {
          name: categoryName,
        });
      }
      return apiClient.post("/restaurant-owner/menu-categories", {
        name: categoryName,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-categories"] });
      closeCategoryModal();
    },
    onError: (err: unknown) => {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save category.");
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/restaurant-owner/menu-categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-categories"] });
      queryClient.invalidateQueries({ queryKey: ["owner-items"] });
    },
  });

  // Item Mutations
  const saveItemMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: itemName,
        category_id: itemCategoryId ? Number(itemCategoryId) : undefined,
        description: itemDescription || undefined,
        image_url: itemImageUrl || undefined,
        base_price: Number(itemPrice),
        is_available: Boolean(itemIsAvailable),
        addon_groups: itemAddonGroups
          .filter((g) => g.title.trim())
          .map((g) => ({
            name: g.title,
            title: g.title,
            options: g.options
              .filter((o) => o.name.trim())
              .map((o) => ({ name: o.name, price: Number(o.price || 0), extra_price: Number(o.price || 0) })),
          })),
        related_item_ids: itemRelatedIds,
      };

      if (editingItem) {
        return apiClient.patch(`/restaurant-owner/menu-items/${editingItem.id}`, payload);
      }
      return apiClient.post("/restaurant-owner/menu-items", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-items"] });
      closeItemModal();
    },
    onError: (err: unknown) => {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save menu item.");
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/restaurant-owner/menu-items/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-items"] });
    },
  });

  // Category Modal Handlers
  const openCategoryModal = (cat?: MenuCategory) => {
    setErrorMsg(null);
    if (cat) {
      setEditingCategory(cat);
      setCategoryName(cat.name);
    } else {
      setEditingCategory(null);
      setCategoryName("");
    }
    setShowCategoryModal(true);
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
    setCategoryName("");
  };

  // Item Modal Handlers
  const openItemModal = (item?: MenuItem) => {
    setErrorMsg(null);
    if (item) {
      setEditingItem(item);
      setItemName(item.name);
      setItemCategoryId(item.category_id || "");
      setItemDescription(item.description || "");
      setItemImageUrl(item.image_url || "");
      setItemPrice(String(item.base_price));
      setItemIsAvailable(Boolean(item.is_available));

      if (item.addon_groups && item.addon_groups.length > 0) {
        setItemAddonGroups(
          item.addon_groups.map((g) => ({
            title: g.name || g.title || "ADD-ONS",
            options: (g.options || []).map((o) => ({
              name: o.name,
              price: String(o.extra_price ?? o.price ?? 0),
            })),
          }))
        );
      } else {
        setItemAddonGroups([
          { title: "ADD-ONS", options: [{ name: "Cheese Slice", price: "50" }] },
        ]);
      }

      setItemRelatedIds(item.related_item_ids || []);
    } else {
      setEditingItem(null);
      setItemName("");
      setItemCategoryId(categories[0]?.id || "");
      setItemDescription("");
      setItemImageUrl("");
      setItemPrice("");
      setItemIsAvailable(true);
      setItemAddonGroups([
        { title: "ADD-ONS", options: [{ name: "Cheese Slice", price: "50" }] },
      ]);
      setItemRelatedIds([]);
    }
    setShowItemModal(true);
  };

  const closeItemModal = () => {
    setShowItemModal(false);
    setEditingItem(null);
    setItemName("");
    setItemCategoryId("");
    setItemDescription("");
    setItemImageUrl("");
    setItemPrice("");
    setItemIsAvailable(true);
  };

  // Addon Group Helpers
  const addAddonGroup = () => {
    setItemAddonGroups((prev) => [...prev, { title: "ADD-ONS", options: [{ name: "", price: "0" }] }]);
  };

  const removeAddonGroup = (gIndex: number) => {
    setItemAddonGroups((prev) => prev.filter((_, idx) => idx !== gIndex));
  };

  const updateGroupTitle = (gIndex: number, title: string) => {
    setItemAddonGroups((prev) =>
      prev.map((g, idx) => (idx === gIndex ? { ...g, title } : g))
    );
  };

  const addOptionToGroup = (gIndex: number) => {
    setItemAddonGroups((prev) =>
      prev.map((g, idx) =>
        idx === gIndex ? { ...g, options: [...g.options, { name: "", price: "0" }] } : g
      )
    );
  };

  const removeOptionFromGroup = (gIndex: number, oIndex: number) => {
    setItemAddonGroups((prev) =>
      prev.map((g, idx) =>
        idx === gIndex
          ? { ...g, options: g.options.filter((_, oIdx) => oIdx !== oIndex) }
          : g
      )
    );
  };

  const updateOptionInGroup = (
    gIndex: number,
    oIndex: number,
    field: "name" | "price",
    value: string
  ) => {
    setItemAddonGroups((prev) =>
      prev.map((g, idx) =>
        idx === gIndex
          ? {
              ...g,
              options: g.options.map((o, oIdx) =>
                oIdx === oIndex ? { ...o, [field]: value } : o
              ),
            }
          : g
      )
    );
  };

  const toggleRelatedItem = (id: number) => {
    setItemRelatedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-6 rounded-2xl border border-amber-200/50">
        <div>
          <h2 className="font-mali uppercase text-xl font-bold text-[#1A1A1A]">
            {isShop ? "Products & Inventory Management" : "Menu & Category Management"}
          </h2>
          <p className="font-poppins text-xs text-gray-500 mt-1">
            {isShop
              ? "Organize store categories, manage product catalog, prices, and availability."
              : "Organize your menu categories, add items, configure Add-ons, and feature Frequently Bought Together items."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openCategoryModal()}
            className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white font-poppins text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-xs transition-all"
          >
            {isShop ? "+ Add Category" : "+ Add Category"}
          </button>
          <button
            type="button"
            onClick={() => openItemModal()}
            className="px-4 py-2.5 rounded-xl bg-[#FCBA08] hover:bg-[#e5a807] font-poppins text-xs font-bold text-[#2B1B0E] shadow-sm transition-all"
          >
            {isShop ? "+ Add New Product" : "+ Add Menu Item"}
          </button>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedCatFilter(null)}
          className={`px-4 py-2 rounded-xl font-poppins text-xs font-semibold whitespace-nowrap transition-all ${
            selectedCatFilter === null
              ? "bg-[#2B1B0E] text-[#FCBA08] shadow-xs"
              : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
        >
          All Items ({menuItems.length})
        </button>
        {categories.map((c) => (
          <div key={c.id} className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSelectedCatFilter(c.id)}
              className={`px-4 py-2 rounded-xl font-poppins text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCatFilter === c.id
                  ? "bg-[#2B1B0E] text-[#FCBA08] shadow-xs"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {c.name}
            </button>
            <button
              type="button"
              onClick={() => openCategoryModal(c)}
              className="p-1.5 text-gray-400 hover:text-amber-600 transition-colors"
              title="Edit Category"
            >
              ✎
            </button>
          </div>
        ))}
      </div>

      {/* Menu Items Grid */}
      {itemsLoading || categoriesLoading ? (
        <div className="p-16 text-center font-poppins text-xs text-gray-400 flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-3 border-[#FCBA08] border-t-transparent rounded-full animate-spin" />
          <span>Loading catalog...</span>
        </div>
      ) : menuItems.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-gray-300 font-poppins flex flex-col items-center gap-3 shadow-2xs">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-[#2B1B0E] flex items-center justify-center text-3xl">
            {isShop ? "🛍️" : "🍽️"}
          </div>
          <h4 className="font-mali text-lg font-bold text-[#2B1B0E]">
            {isShop ? "No products in this category yet" : "No items in this category yet"}
          </h4>
          <p className="font-poppins text-xs text-gray-500 max-w-sm">
            {isShop
              ? "Add your first product to this category so customers can browse and purchase it."
              : "Add your first menu item to this category so customers can view and order it."}
          </p>
          <button
            type="button"
            onClick={() => openItemModal()}
            className="px-5 py-2.5 rounded-xl bg-[#FCBA08] hover:bg-[#e5a807] font-poppins text-xs font-bold text-[#2B1B0E] shadow-xs transition-all mt-1"
          >
            {isShop ? "+ Add First Product" : "+ Add First Item"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex gap-4 items-start">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 flex-shrink-0">
                  <Image
                    src={item.image_url || "/item1.png"}
                    alt={item.name}
                    fill
                    className="object-cover"
                    unoptimized={item.image_url?.startsWith("data:")}
                  />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-poppins font-bold text-sm text-[#1A1A1A] truncate">
                      {item.name}
                    </span>
                    <span
                      className={`text-[10px] font-poppins font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${
                        item.is_available
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : "bg-amber-100 text-amber-800 border-amber-300"
                      }`}
                    >
                      {item.is_available ? "Available" : "Unavailable"}
                    </span>
                  </div>
                  <p className="font-poppins text-xs text-gray-500 line-clamp-2 mt-1">
                    {item.description || "No description provided."}
                  </p>
                  <span className="font-poppins font-extrabold text-base text-[#2B1B0E] mt-2">
                    ${Number(item.base_price).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 mt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => openItemModal(item)}
                  className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs font-poppins font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => deleteItemMutation.mutate(item.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-red-50 text-red-600 border border-red-200/60 text-xs font-poppins font-semibold hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CATEGORY MODAL */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl flex flex-col gap-4 animate-in zoom-in-95 duration-150">
            <h3 className="font-mali uppercase text-lg font-bold text-[#1A1A1A]">
              {editingCategory
                ? isShop
                  ? "Edit Product Category"
                  : "Edit Category"
                : isShop
                ? "Add Product Category"
                : "Add Menu Category"}
            </h3>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-poppins font-medium">
                {errorMsg}
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="font-poppins text-xs font-semibold text-gray-700">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder={
                  isShop
                    ? "e.g. Grocery, Bakery, Beverages, Snacks, Household"
                    : "e.g. Starters, Burgers, Beverages"
                }
                className="w-full rounded-xl border border-gray-200 p-3 font-poppins text-sm focus:outline-none focus:ring-2 focus:ring-[#FCBA08]/40"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              {editingCategory ? (
                <button
                  type="button"
                  onClick={() => {
                    deleteCategoryMutation.mutate(editingCategory.id);
                    closeCategoryModal();
                  }}
                  className="text-xs font-poppins text-red-600 font-semibold hover:underline"
                >
                  Delete Category
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeCategoryModal}
                  className="px-4 py-2 text-xs font-poppins font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => saveCategoryMutation.mutate()}
                  disabled={saveCategoryMutation.isPending || !categoryName.trim()}
                  className="px-4 py-2 text-xs font-poppins font-bold bg-[#FCBA08] text-[#2B1B0E] rounded-xl shadow-sm hover:bg-[#e5a807] disabled:opacity-50"
                >
                  {saveCategoryMutation.isPending ? "Saving..." : "Save Category"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MENU ITEM MODAL (WITH ADD-ONS & FREQUENTLY BOUGHT TOGETHER BUILDER) */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl flex flex-col gap-4 my-8 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <h3 className="font-mali uppercase text-lg font-bold text-[#1A1A1A]">
              {editingItem
                ? isShop
                  ? "Edit Product"
                  : "Edit Menu Item"
                : isShop
                ? "Add New Product"
                : "Add Menu Item"}
            </h3>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-poppins font-medium">
                {errorMsg}
              </div>
            )}

            <div className="flex flex-col gap-4 font-poppins">
              <div className="flex flex-col gap-1">
                <label className="font-poppins text-xs font-semibold text-gray-700">
                  {isShop ? "Product Name" : "Item Name"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder={isShop ? "e.g. Organic Whole Wheat Bread 500g" : "e.g. Jumbo Zinger Burger"}
                  className="w-full rounded-xl border border-gray-200 p-3 font-poppins text-sm focus:outline-none focus:ring-2 focus:ring-[#FCBA08]/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-poppins text-xs font-semibold text-gray-700">
                    Category
                  </label>
                  <select
                    value={itemCategoryId}
                    onChange={(e) => setItemCategoryId(e.target.value ? Number(e.target.value) : "")}
                    className="w-full rounded-xl border border-gray-200 p-3 font-poppins text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FCBA08]/40"
                  >
                    <option value="">Uncategorized</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-poppins text-xs font-semibold text-gray-700">
                    {isShop ? "Price (Rs.)" : "Base Price (Rs.)"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    placeholder={isShop ? "250.00" : "480.00"}
                    className="w-full rounded-xl border border-gray-200 p-3 font-poppins text-sm focus:outline-none focus:ring-2 focus:ring-[#FCBA08]/40"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-poppins text-xs font-semibold text-gray-700">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  placeholder={
                    isShop
                      ? "Product brand, weight, specifications or details..."
                      : "Ingredients, preparation details..."
                  }
                  className="w-full rounded-xl border border-gray-200 p-3 font-poppins text-sm focus:outline-none focus:ring-2 focus:ring-[#FCBA08]/40 resize-none"
                />
              </div>

              <ImageUpload
                purpose="menu-item"
                label={isShop ? "Product Image" : "Menu Item Image"}
                value={itemImageUrl}
                onChange={setItemImageUrl}
              />

              {/* ADD-ONS SECTION BUILDER (RESTAURANT ONLY) */}
              {!isShop && (
                <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/60 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-mali text-sm font-bold text-[#2B1B0E]">
                      Add-ons Configurator
                    </h4>
                    <button
                      type="button"
                      onClick={addAddonGroup}
                      className="text-xs font-poppins font-bold text-amber-800 hover:underline"
                    >
                      + Add Addon Group
                    </button>
                  </div>

                  {itemAddonGroups.map((group, gIdx) => (
                    <div key={gIdx} className="p-3 rounded-lg bg-white border border-amber-100 flex flex-col gap-2 shadow-xs">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={group.title}
                          onChange={(e) => updateGroupTitle(gIdx, e.target.value)}
                          placeholder="Addon Group Title (e.g. ADD-ONS)"
                          className="font-poppins text-xs font-bold text-[#1A1A1A] border-b border-gray-200 focus:outline-none focus:border-[#FCBA08] px-1 py-0.5 flex-1"
                        />
                        {itemAddonGroups.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeAddonGroup(gIdx)}
                            className="text-xs text-red-500 font-bold hover:underline"
                          >
                            Remove Group
                          </button>
                        )}
                      </div>

                      {/* Options Rows */}
                      <div className="flex flex-col gap-1.5 mt-1">
                        {group.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={opt.name}
                              onChange={(e) => updateOptionInGroup(gIdx, oIdx, "name", e.target.value)}
                              placeholder="Option Name (e.g. Cheese Slice)"
                              className="flex-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#FCBA08]"
                            />
                            <div className="flex items-center gap-1 w-28">
                              <span className="text-xs font-bold text-gray-500">Rs.</span>
                              <input
                                type="number"
                                value={opt.price}
                                onChange={(e) => updateOptionInGroup(gIdx, oIdx, "price", e.target.value)}
                                placeholder="50"
                                className="w-full rounded-lg border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#FCBA08]"
                              />
                            </div>
                            {group.options.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeOptionFromGroup(gIdx, oIdx)}
                                className="text-xs text-red-400 font-bold hover:text-red-600 px-1"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => addOptionToGroup(gIdx)}
                        className="text-[11px] font-poppins font-semibold text-amber-700 hover:underline self-start mt-1"
                      >
                        + Add Option
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* FREQUENTLY BOUGHT TOGETHER ITEM SELECTOR */}
              {menuItems.length > 1 && (
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 flex flex-col gap-2">
                  <h4 className="font-mali text-sm font-bold text-[#2B1B0E]">
                    Frequently Bought Together Feature Items
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Select which items from your restaurant customers frequently buy together with this product.
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-1 max-h-36 overflow-y-auto">
                    {menuItems
                      .filter((m) => editingItem ? m.id !== editingItem.id : true)
                      .map((m) => {
                        const isChecked = itemRelatedIds.includes(m.id);
                        return (
                          <label key={m.id} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-100 cursor-pointer text-xs font-poppins">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleRelatedItem(m.id)}
                              className="w-4 h-4 accent-[#FCBA08] rounded"
                            />
                            <span className="truncate font-medium">{m.name} (+Rs.{m.base_price})</span>
                          </label>
                        );
                      })}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="availability-toggle"
                  checked={itemIsAvailable}
                  onChange={(e) => setItemIsAvailable(e.target.checked)}
                  className="w-4 h-4 accent-[#FCBA08] rounded cursor-pointer"
                />
                <label htmlFor="availability-toggle" className="font-poppins text-xs font-semibold text-gray-700 cursor-pointer">
                  Available for Customer Ordering
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={closeItemModal}
                className="px-4 py-2 text-xs font-poppins font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => saveItemMutation.mutate()}
                disabled={saveItemMutation.isPending || !itemName.trim() || !itemPrice}
                className="px-4 py-2 text-xs font-poppins font-bold bg-[#FCBA08] text-[#2B1B0E] rounded-xl shadow-sm hover:bg-[#e5a807] disabled:opacity-50"
              >
                {saveItemMutation.isPending ? "Saving..." : "Save Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
