"use client";

import React, { useState, useEffect } from "react";
import {
  Smartphone,
  Edit2,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Plus,
  Check,
  X,
  Radio,
} from "lucide-react";

interface DeviceRecord {
  id: string;
  deviceName: string;
  browser: string;
  platform: string;
  clientIp: string | null;
  lastConnectedAt: string;
  isBlocked: boolean;
}

export function DevicesTab() {
  const [devicesList, setDevicesList] = useState<DeviceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditingName] = useState("");

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/devices");
      const data = await res.json();
      if (data.success) {
        setDevicesList(data.devices || []);
      }
    } catch (e) {
      console.error("Failed to fetch devices", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleRename = async (id: string) => {
    if (!editName.trim()) return;
    try {
      await fetch("/api/devices", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, deviceName: editName.trim() }),
      });
      setEditingId(null);
      fetchDevices();
    } catch (e) {
      console.error("Failed to rename device", e);
    }
  };

  const handleToggleBlock = async (id: string, currentBlocked: boolean) => {
    try {
      await fetch("/api/devices", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isBlocked: !currentBlocked }),
      });
      fetchDevices();
    } catch (e) {
      console.error("Failed to block device", e);
    }
  };

  const handleForgetDevice = async (id: string) => {
    try {
      await fetch(`/api/devices?id=${id}`, {
        method: "DELETE",
      });
      fetchDevices();
    } catch (e) {
      console.error("Failed to forget device", e);
    }
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Paired Devices</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage mobile web browser clients authorized to pair with Windows.
          </p>
        </div>
        <button
          onClick={fetchDevices}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs border border-zinc-700 flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {devicesList.length === 0 ? (
          <div className="p-12 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-3 text-zinc-500">
            <Smartphone className="w-12 h-12 mx-auto text-zinc-700" />
            <div className="text-base font-bold text-zinc-400">No Paired Devices Stored</div>
            <div className="text-xs max-w-sm mx-auto text-zinc-500">
              When a phone scans a pairing QR code, it will be registered in your verified devices inventory.
            </div>
          </div>
        ) : (
          devicesList.map((dev) => (
            <div
              key={dev.id}
              className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-zinc-700 transition-all"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-bold ${
                    dev.isBlocked
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                      : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  }`}
                >
                  <Smartphone className="w-6 h-6" />
                </div>

                <div>
                  {editingId === dev.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="px-3 py-1 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white outline-none"
                      />
                      <button
                        onClick={() => handleRename(dev.id)}
                        className="p-1.5 rounded-lg bg-emerald-500 text-black font-bold"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{dev.deviceName}</h3>
                      <button
                        onClick={() => {
                          setEditingId(dev.id);
                          setEditingName(dev.deviceName);
                        }}
                        className="text-zinc-500 hover:text-zinc-300 p-1"
                        title="Rename Device"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <div className="text-xs text-zinc-400 font-mono mt-1 space-x-3">
                    <span>{dev.browser}</span>
                    <span>•</span>
                    <span>{dev.platform}</span>
                    <span>•</span>
                    <span>IP: {dev.clientIp || "127.0.0.1"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleBlock(dev.id, dev.isBlocked)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    dev.isBlocked
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30"
                      : "bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30"
                  }`}
                >
                  {dev.isBlocked ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Unblock</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Block</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleForgetDevice(dev.id)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 text-xs font-bold border border-zinc-800 transition-all flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Forget</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
