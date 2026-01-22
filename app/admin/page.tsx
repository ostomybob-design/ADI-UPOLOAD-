"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminPage() {
  const [tickerMessages, setTickerMessages] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [jokes, setJokes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Editing states
  const [editingTicker, setEditingTicker] = useState<any>(null);
  const [editingQuote, setEditingQuote] = useState<any>(null);
  const [editingJoke, setEditingJoke] = useState<any>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [tickerRes, quotesRes, jokesRes] = await Promise.all([
        fetch("/api/admin/ticker"),
        fetch("/api/admin/quotes"),
        fetch("/api/admin/jokes"),
      ]);

      if (tickerRes.ok) {
        setTickerMessages(await tickerRes.json());
      } else {
        console.error("Failed to fetch ticker messages");
        setTickerMessages([]);
      }

      if (quotesRes.ok) {
        setQuotes(await quotesRes.json());
      } else {
        console.error("Failed to fetch quotes");
        setQuotes([]);
      }

      if (jokesRes.ok) {
        setJokes(await jokesRes.json());
      } else {
        console.error("Failed to fetch jokes");
        setJokes([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      // Set empty arrays so the UI still loads
      setTickerMessages([]);
      setQuotes([]);
      setJokes([]);
    } finally {
      setLoading(false);
    }
  };

  // Ticker Message handlers
  const handleSaveTicker = async () => {
    try {
      const url = "/api/admin/ticker";
      const method = editingTicker.id ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingTicker),
      });

      if (!response.ok) throw new Error("Failed to save");

      await fetchAllData();
      setEditingTicker(null);
      alert("Ticker message saved!");
    } catch (error) {
      console.error("Error saving ticker:", error);
      alert("Failed to save ticker message");
    }
  };

  const handleDeleteTicker = async (id: number) => {
    if (!confirm("Are you sure you want to delete this ticker message?")) return;

    try {
      const response = await fetch(`/api/admin/ticker?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      await fetchAllData();
      alert("Ticker message deleted!");
    } catch (error) {
      console.error("Error deleting ticker:", error);
      alert("Failed to delete ticker message");
    }
  };

  // Quote handlers
  const handleSaveQuote = async () => {
    try {
      const url = "/api/admin/quotes";
      const method = editingQuote.id ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingQuote),
      });

      if (!response.ok) throw new Error("Failed to save");

      await fetchAllData();
      setEditingQuote(null);
      alert("Quote saved!");
    } catch (error) {
      console.error("Error saving quote:", error);
      alert("Failed to save quote");
    }
  };

  const handleDeleteQuote = async (id: number) => {
    if (!confirm("Are you sure you want to delete this quote?")) return;

    try {
      const response = await fetch(`/api/admin/quotes?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      await fetchAllData();
      alert("Quote deleted!");
    } catch (error) {
      console.error("Error deleting quote:", error);
      alert("Failed to delete quote");
    }
  };

  // Joke handlers
  const handleSaveJoke = async () => {
    try {
      const url = "/api/admin/jokes";
      const method = editingJoke.id ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingJoke),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save");
      }

      await fetchAllData();
      setEditingJoke(null);
      alert("Joke saved!");
    } catch (error: any) {
      console.error("Error saving joke:", error);
      alert(error.message || "Failed to save joke");
    }
  };

  const handleDeleteJoke = async (id: number) => {
    if (!confirm("Are you sure you want to delete this joke?")) return;

    try {
      const response = await fetch(`/api/admin/jokes?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      await fetchAllData();
      alert("Joke deleted!");
    } catch (error) {
      console.error("Error deleting joke:", error);
      alert("Failed to delete joke");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Content Management</h1>

      <Tabs defaultValue="ticker" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ticker">Ticker Messages</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
          <TabsTrigger value="jokes">Joke of the Day</TabsTrigger>
        </TabsList>

        {/* Ticker Messages Tab */}
        <TabsContent value="ticker" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Ticker Messages</h2>
            <Button
              onClick={() =>
                setEditingTicker({ message: "", is_active: true, order_index: 0 })
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Message
            </Button>
          </div>

          {editingTicker && (
            <Card className="p-4 bg-blue-50">
              <div className="space-y-3">
                <Input
                  placeholder="Ticker message"
                  value={editingTicker.message}
                  onChange={(e) =>
                    setEditingTicker({ ...editingTicker, message: e.target.value })
                  }
                />
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingTicker.is_active}
                      onChange={(e) =>
                        setEditingTicker({
                          ...editingTicker,
                          is_active: e.target.checked,
                        })
                      }
                    />
                    Active
                  </label>
                  <Input
                    type="number"
                    placeholder="Order"
                    className="w-24"
                    value={editingTicker.order_index}
                    onChange={(e) =>
                      setEditingTicker({
                        ...editingTicker,
                        order_index: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveTicker}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setEditingTicker(null)}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <div className="space-y-2">
            {tickerMessages.map((message) => (
              <Card key={message.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{message.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={message.is_active ? "default" : "secondary"}>
                        {message.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Order: {message.order_index}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingTicker(message)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteTicker(message.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Quotes Tab */}
        <TabsContent value="quotes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Inspirational Quotes</h2>
            <Button
              onClick={() =>
                setEditingQuote({ quote: "", author: "", category: "", is_active: true })
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Quote
            </Button>
          </div>

          {editingQuote && (
            <Card className="p-4 bg-blue-50">
              <div className="space-y-3">
                <Textarea
                  placeholder="Quote text"
                  value={editingQuote.quote}
                  onChange={(e) =>
                    setEditingQuote({ ...editingQuote, quote: e.target.value })
                  }
                  rows={3}
                />
                <Input
                  placeholder="Author (optional)"
                  value={editingQuote.author}
                  onChange={(e) =>
                    setEditingQuote({ ...editingQuote, author: e.target.value })
                  }
                />
                <Input
                  placeholder="Category (e.g., motivation, health, humor)"
                  value={editingQuote.category}
                  onChange={(e) =>
                    setEditingQuote({ ...editingQuote, category: e.target.value })
                  }
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingQuote.is_active}
                    onChange={(e) =>
                      setEditingQuote({
                        ...editingQuote,
                        is_active: e.target.checked,
                      })
                    }
                  />
                  Active
                </label>
                <div className="flex gap-2">
                  <Button onClick={handleSaveQuote}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setEditingQuote(null)}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <div className="space-y-2">
            {quotes.map((quote) => (
              <Card key={quote.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="italic">"{quote.quote}"</p>
                    {quote.author && (
                      <p className="text-sm text-gray-600 mt-1">— {quote.author}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={quote.is_active ? "default" : "secondary"}>
                        {quote.is_active ? "Active" : "Inactive"}
                      </Badge>
                      {quote.category && (
                        <Badge variant="outline">{quote.category}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingQuote(quote)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteQuote(quote.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Jokes Tab */}
        <TabsContent value="jokes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Joke of the Day</h2>
            <Button
              onClick={() =>
                setEditingJoke({
                  joke: "",
                  punchline: "",
                  date: new Date().toISOString().split("T")[0],
                  is_active: true,
                })
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Joke
            </Button>
          </div>

          {editingJoke && (
            <Card className="p-4 bg-blue-50">
              <div className="space-y-3">
                <Input
                  type="date"
                  value={editingJoke.date.split("T")[0]}
                  onChange={(e) =>
                    setEditingJoke({ ...editingJoke, date: e.target.value })
                  }
                />
                <Textarea
                  placeholder="Joke setup"
                  value={editingJoke.joke}
                  onChange={(e) =>
                    setEditingJoke({ ...editingJoke, joke: e.target.value })
                  }
                  rows={2}
                />
                <Textarea
                  placeholder="Punchline (optional)"
                  value={editingJoke.punchline || ""}
                  onChange={(e) =>
                    setEditingJoke({ ...editingJoke, punchline: e.target.value })
                  }
                  rows={2}
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingJoke.is_active}
                    onChange={(e) =>
                      setEditingJoke({
                        ...editingJoke,
                        is_active: e.target.checked,
                      })
                    }
                  />
                  Active
                </label>
                <div className="flex gap-2">
                  <Button onClick={handleSaveJoke}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setEditingJoke(null)}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <div className="space-y-2">
            {jokes.map((joke) => (
              <Card key={joke.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-2">
                      {new Date(joke.date).toLocaleDateString()}
                    </p>
                    <p className="font-medium">{joke.joke}</p>
                    {joke.punchline && (
                      <p className="text-gray-700 mt-1">{joke.punchline}</p>
                    )}
                    <div className="mt-2">
                      <Badge variant={joke.is_active ? "default" : "secondary"}>
                        {joke.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingJoke(joke)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteJoke(joke.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
