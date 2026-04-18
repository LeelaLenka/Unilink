import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { PostCard } from "../components/PostCard";

export function Feed() {
  const qc = useQueryClient();
  const [content, setContent] = useState("");

  const postsQuery = useQuery({
    queryKey: ["posts"],
    queryFn: async () => (await api.get("/posts")).data.posts,
  });

  const createPost = useMutation({
    mutationFn: async () => (await api.post("/posts", { content })).data,
    onSuccess: async () => {
      setContent("");
      await qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
      <div className="space-y-4">
        <div className="card p-4">
          <div className="text-sm font-medium text-white">Share an update</div>
          <form
            className="mt-3 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!content.trim()) return;
              createPost.mutate();
            }}
          >
            <textarea
              className="input min-h-[96px] resize-none"
              placeholder="Share something with your campus..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-400">{content.length}/2000</div>
              <button className="btn-primary" disabled={createPost.isPending}>
                {createPost.isPending ? "Posting…" : "Post"}
              </button>
            </div>
          </form>
        </div>

        {postsQuery.isLoading ? (
          <div className="card p-6 text-sm text-slate-300">Loading feed…</div>
        ) : postsQuery.isError ? (
          <div className="card p-6 text-sm text-rose-300">Failed to load posts.</div>
        ) : postsQuery.data?.length > 0 ? (
          <div className="space-y-4">
            {postsQuery.data.map((p) => (
              <PostCard post={p} key={p._id} />
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center border-dashed border-white/20 bg-transparent">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-4">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No posts yet</h3>
            <p className="text-sm text-slate-400 mb-4">
              The feed is quiet. Be the first one to share an update, an idea, or an announcement!
            </p>
            <button 
              className="btn-primary"
              onClick={() => {
                const textarea = document.querySelector('textarea.input');
                if(textarea) { textarea.focus(); textarea.scrollIntoView({behavior: 'smooth', block: 'center'}); }
              }}
            >
              Share an update
            </button>
          </div>
        )}
      </div>

      <aside className="space-y-4">
        <div className="card p-4">
          <div className="text-sm font-medium text-[var(--text-primary)]">UniLink tips</div>
          <ul className="mt-2 space-y-2 text-sm text-[var(--text-secondary)]">
            <li>Post your hackathon ideas and find teammates.</li>
            <li>Keep your profile updated with skills + certifications.</li>
            <li>Check Events for workshops and placements.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

