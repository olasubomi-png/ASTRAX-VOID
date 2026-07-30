"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { Plus, Pencil, Trash2 } from "lucide-react";

const products = [
  { id: "1", name: "ASTRAX VIP Elite", price: 79.99, stock: "∞", status: "Active" },
  { id: "2", name: "CODM Premium V5", price: 49.99, stock: "50", status: "Active" },
  { id: "3", name: "Unlock Tool Pro", price: 19.99, stock: "∞", status: "Active" },
  { id: "4", name: "Dominator Bundle", price: 119.99, stock: "20", status: "Active" },
];

export default function AdminProductsPage() {
  return (
    <div className="section-padding">
      <div className="container-max">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="font-display text-3xl font-bold">
            Manage <span className="neon-text">Products</span>
          </h1>
          <div className="flex gap-2">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                ← Admin
              </Button>
            </Link>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          </div>
        </div>

        <div className="card-glow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-muted-foreground">
                  <th className="p-4 font-medium">Product</th>
                  <th className="p-4 font-medium">Price</th>
                  <th className="p-4 font-medium">Stock</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4 font-medium text-white">{p.name}</td>
                    <td className="p-4">{formatPrice(p.price)}</td>
                    <td className="p-4">{p.stock}</td>
                    <td className="p-4">
                      <span className="rounded-lg bg-green-400/10 text-green-400 px-2 py-0.5 text-xs">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
