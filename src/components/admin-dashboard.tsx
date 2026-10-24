"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminUser } from "@/lib/admin-guard";
import { formatUsd } from "@/lib/money";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import type { Order, ProductWithImages, ShippingAddress } from "@/lib/types";

type Tab = "styles" | "orders" | "edit";

export function AdminDashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>("styles");
  const [products, setProducts] = useState<ProductWithImages[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editing, setEditing] = useState<ProductWithImages | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<
    (Order & { items?: { id: string; name: string; quantity: number; unit_price_cents: number }[] }) | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const user = await getAdminUser();
    if (!user) {
      router.replace("/admin/login/");
      return;
    }

    const supabase = createBrowserSupabase();
    if (!supabase) return;

    const [{ data: productRows }, { data: orderRows }] = await Promise.all([
      supabase
        .from("products")
        .select(
          "*, product_images(id, product_id, storage_path, alt, sort_order)",
        )
        .order("sort_order"),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
    ]);

    setProducts((productRows || []) as ProductWithImages[]);
    setOrders((orderRows || []) as Order[]);
    setReady(true);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function signOut() {
    const supabase = createBrowserSupabase();
    await supabase?.auth.signOut();
    router.replace("/admin/login/");
  }

  async function saveProduct(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const supabase = createBrowserSupabase();
    if (!supabase) return;

    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") || "");
    const slug =
      String(form.get("slug") || "").trim() ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    const payload = {
      name,
      slug,
      description: String(form.get("description") || ""),
      price_cents: Number(form.get("price_cents") || 0),
      compare_at_cents: Number(form.get("compare_at_cents") || 0) || null,
      stock: Number(form.get("stock") || 0),
      sort_order: Number(form.get("sort_order") || 0),
      active: form.get("active") === "on",
      featured: form.get("featured") === "on",
    };

    let productId = editing?.id;
    if (productId) {
      const { error: updateError } = await supabase
        .from("products")
        .update(payload)
        .eq("id", productId);
      if (updateError) {
        setError(updateError.message);
        return;
      }
    } else {
      const { data, error: insertError } = await supabase
        .from("products")
        .insert(payload)
        .select("id")
        .single();
      if (insertError || !data) {
        setError(insertError?.message || "Could not create style");
        return;
      }
      productId = data.id;
    }

    const imageUrl = String(form.get("image_url") || "").trim();
    const file = form.get("image_file");
    if (file instanceof File && file.size > 0) {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${productId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file, { upsert: true });
      if (!uploadError) {
        await supabase.from("product_images").delete().eq("product_id", productId);
        await supabase.from("product_images").insert({
          product_id: productId,
          storage_path: path,
          alt: name,
          sort_order: 0,
        });
      }
    } else if (imageUrl) {
      await supabase.from("product_images").delete().eq("product_id", productId);
      await supabase.from("product_images").insert({
        product_id: productId,
        storage_path: imageUrl,
        alt: name,
        sort_order: 0,
      });
    }

    setEditing(null);
    setTab("styles");
    await load();
  }

  async function deleteProduct(id: string) {
    const supabase = createBrowserSupabase();
    if (!supabase) return;
    await supabase.from("products").delete().eq("id", id);
    setEditing(null);
    setTab("styles");
    await load();
  }

  async function openOrder(order: Order) {
    const supabase = createBrowserSupabase();
    if (!supabase) return;
    const { data: items } = await supabase
      .from("order_items")
      .select("id, name, quantity, unit_price_cents")
      .eq("order_id", order.id);
    setSelectedOrder({ ...order, items: items || [] });
  }

  async function saveOrder(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedOrder) return;
    const supabase = createBrowserSupabase();
    if (!supabase) return;
    const form = new FormData(e.currentTarget);
    const tracking = String(form.get("tracking_number") || "").trim();
    const markShipped = form.get("mark_shipped") === "on";
    await supabase
      .from("orders")
      .update({
        tracking_number: tracking || null,
        ...(markShipped ? { status: "shipped" } : {}),
      })
      .eq("id", selectedOrder.id);
    setSelectedOrder(null);
    await load();
  }

  if (!ready) {
    return <p className="text-ink/55">Loading admin…</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-ink/60">
            Manage styles and fulfill US orders.
          </p>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="text-sm text-ink/55 hover:text-ink"
        >
          Sign out
        </button>
      </div>

      <div className="mt-8 flex gap-2">
        <TabButton active={tab === "styles"} onClick={() => setTab("styles")}>
          Styles ({products.length})
        </TabButton>
        <TabButton active={tab === "orders"} onClick={() => setTab("orders")}>
          Orders ({orders.length})
        </TabButton>
        <TabButton
          active={tab === "edit"}
          onClick={() => {
            setEditing(null);
            setTab("edit");
          }}
        >
          New style
        </TabButton>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-petal/15 px-4 py-3 text-sm">{error}</p>
      )}

      {tab === "styles" && (
        <ul className="mt-8 divide-y divide-ink/8 rounded-2xl border border-ink/10 bg-foam/70">
          {products.length === 0 && (
            <li className="px-5 py-10 text-sm text-ink/55">No styles yet.</li>
          )}
          {products.map((product) => (
            <li key={product.id}>
              <button
                type="button"
                onClick={() => {
                  setEditing(product);
                  setTab("edit");
                }}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-blush/10"
              >
                <div>
                  <p className="font-medium text-ink">{product.name}</p>
                  <p className="text-xs text-ink/45">
                    /{product.slug} · stock {product.stock}
                    {!product.active ? " · inactive" : ""}
                  </p>
                </div>
                <p className="text-sm">{formatUsd(product.price_cents)}</p>
              </button>
            </li>
          ))}
        </ul>
      )}

      {tab === "orders" && !selectedOrder && (
        <ul className="mt-8 divide-y divide-ink/8 rounded-2xl border border-ink/10 bg-foam/70">
          {orders.length === 0 && (
            <li className="px-5 py-10 text-sm text-ink/55">No orders yet.</li>
          )}
          {orders.map((order) => (
            <li key={order.id}>
              <button
                type="button"
                onClick={() => openOrder(order)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-blush/10"
              >
                <div>
                  <p className="font-medium text-ink">{order.email}</p>
                  <p className="text-xs text-ink/45">
                    {order.status} ·{" "}
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-sm">{formatUsd(order.total_cents)}</p>
              </button>
            </li>
          ))}
        </ul>
      )}

      {tab === "orders" && selectedOrder && (
        <div className="mt-8 max-w-2xl">
          <button
            type="button"
            onClick={() => setSelectedOrder(null)}
            className="text-sm text-ink/55 hover:text-ink"
          >
            ← Back to orders
          </button>
          <h2 className="mt-4 font-display text-2xl">{selectedOrder.email}</h2>
          <p className="text-sm text-ink/55">{selectedOrder.status}</p>
          <ul className="mt-6 space-y-2 text-sm">
            {(selectedOrder.items || []).map((item) => (
              <li
                key={item.id}
                className="flex justify-between rounded-xl border border-ink/8 bg-foam/60 px-4 py-3"
              >
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>
                  {formatUsd(item.unit_price_cents * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          {selectedOrder.shipping_address && (
            <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-foam/70 p-4 text-sm text-ink/70">
              {formatAddress(selectedOrder.shipping_address)}
            </pre>
          )}
          <form onSubmit={saveOrder} className="mt-6 space-y-4">
            <label className="block text-sm">
              <span className="text-ink/60">Tracking number</span>
              <input
                name="tracking_number"
                defaultValue={selectedOrder.tracking_number || ""}
                className="mt-1 h-11 w-full rounded-xl border border-ink/15 bg-foam px-3"
              />
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="mark_shipped"
                defaultChecked={selectedOrder.status === "shipped"}
              />
              Mark as shipped
            </label>
            <button
              type="submit"
              className="block h-11 rounded-full bg-ink px-6 text-sm text-foam"
            >
              Save fulfillment
            </button>
          </form>
        </div>
      )}

      {tab === "edit" && (
        <form
          onSubmit={saveProduct}
          className="mt-8 max-w-xl space-y-4"
          encType="multipart/form-data"
        >
          <h2 className="font-display text-2xl">
            {editing ? "Edit style" : "New style"}
          </h2>
          <Field name="name" label="Name" defaultValue={editing?.name} required />
          <Field name="slug" label="Slug" defaultValue={editing?.slug} />
          <label className="block text-sm">
            <span className="text-ink/60">Description</span>
            <textarea
              name="description"
              rows={4}
              defaultValue={editing?.description}
              className="mt-1 w-full rounded-xl border border-ink/15 bg-foam px-3 py-2"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              name="price_cents"
              label="Price (cents)"
              type="number"
              defaultValue={editing?.price_cents ?? 2800}
              required
            />
            <Field
              name="compare_at_cents"
              label="Compare-at (cents)"
              type="number"
              defaultValue={editing?.compare_at_cents ?? ""}
            />
            <Field
              name="stock"
              label="Stock"
              type="number"
              defaultValue={editing?.stock ?? 10}
              required
            />
            <Field
              name="sort_order"
              label="Sort order"
              type="number"
              defaultValue={editing?.sort_order ?? 0}
            />
          </div>
          <div className="flex gap-6 text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                name="active"
                defaultChecked={editing?.active ?? true}
              />
              Active
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={editing?.featured ?? false}
              />
              Featured
            </label>
          </div>
          <Field
            name="image_url"
            label="Image URL"
            defaultValue={
              editing?.product_images[0]?.storage_path.startsWith("http")
                ? editing.product_images[0].storage_path
                : ""
            }
          />
          <label className="block text-sm">
            <span className="text-ink/60">Or upload image</span>
            <input
              type="file"
              name="image_file"
              accept="image/*"
              className="mt-1 block w-full text-sm"
            />
          </label>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="h-11 rounded-full bg-ink px-6 text-sm text-foam"
            >
              Save
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => deleteProduct(editing.id)}
                className="h-11 rounded-full border border-petal/40 px-6 text-sm text-petal"
              >
                Delete
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-full bg-ink px-4 py-2 text-sm text-foam"
          : "rounded-full border border-ink/15 px-4 py-2 text-sm text-ink/70"
      }
    >
      {children}
    </button>
  );
}

function Field({
  name,
  label,
  defaultValue,
  type = "text",
  required,
}: {
  name: string;
  label: string;
  defaultValue?: string | number;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="text-ink/60">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="mt-1 h-11 w-full rounded-xl border border-ink/15 bg-foam px-3"
      />
    </label>
  );
}

function formatAddress(address: ShippingAddress) {
  return [
    address.name,
    address.line1,
    address.line2,
    [address.city, address.state, address.postal_code].filter(Boolean).join(", "),
    address.country,
  ]
    .filter(Boolean)
    .join("\n");
}
