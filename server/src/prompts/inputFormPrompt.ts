import type { InputFormRequest } from '../types.js';

export function buildInputFormPrompt(req: InputFormRequest): string {
  const previousContext = req.previousSteps
    .map((s, i) => {
      const role = s.assignment === 'agent' ? 'Agent' : 'User';
      const result = s.result ? `Result: ${s.result.slice(0, 300)}` : 'Not yet completed';
      return `  Step ${i + 1} (${role}): ${s.description}\n  ${result}`;
    })
    .join('\n');

  return `You are a UX engineer. Generate a single self-contained React component as JSX code that creates a beautiful, tailored input form for the user step described below.

<scope>
Available in scope (do NOT import anything):
- React hooks: useState, useEffect, useCallback, useMemo
- Lucide icons: ChevronUp, ChevronDown, Check, X, Plus, Minus, Star, Heart, ThumbsUp, ThumbsDown, ArrowRight, Send, Info, AlertCircle, HelpCircle, Search, Filter, Edit, Trash2, Copy, RefreshCw, Eye, EyeOff, ChevronLeft, ChevronRight, GripVertical, Calendar, Clock, MapPin, User, Mail, Phone, Link, Hash, Tag, Flag, Bookmark, Award, Zap, Target, TrendingUp, BarChart2, PieChart, List, Grid, Layout, Layers, Settings, Sliders
- Callback: onSubmit(markdownString) — call this when the user submits with a markdown-formatted string of their responses
</scope>

<design_tokens>
Use ONLY these Tailwind classes so they are safelisted:

Layout: flex, flex-col, flex-row, flex-wrap, flex-1, items-center, items-start, items-end, justify-between, justify-center, justify-end, gap-1, gap-1.5, gap-2, gap-3, gap-4, space-y-1, space-y-1.5, space-y-2, space-y-3, space-y-4, grid, grid-cols-2, grid-cols-3, col-span-2
Sizing: w-full, w-5, w-6, w-8, w-10, h-5, h-6, h-8, h-10, h-20, h-24, min-h-[60px], max-w-none
Spacing: p-0.5, p-1, p-2, p-3, p-4, px-2, px-2.5, px-3, px-3.5, px-4, py-1, py-1.5, py-2, py-2.5, pt-1, pt-2, mt-0.5, mt-1, mt-2, mt-3, mb-1, mb-1.5, mb-2, mb-3, ml-2
Typography: text-xs, text-sm, text-base, text-lg, text-xl, font-medium, font-semibold, font-bold, text-center, text-left, text-right, leading-tight, tracking-wide
Colors: text-stone-400, text-stone-500, text-stone-600, text-stone-700, text-stone-800, text-sky-500, text-sky-600, text-sky-700, text-white, text-red-500, text-amber-600, text-emerald-600, bg-white, bg-stone-50, bg-stone-100, bg-stone-200, bg-sky-50, bg-sky-100, bg-sky-500, bg-sky-600, bg-amber-50, bg-emerald-50, bg-red-50
Borders: border, border-t, border-b, border-stone-100, border-stone-200, border-stone-300, border-sky-200, border-sky-300, border-sky-500, border-red-200, border-amber-200, border-emerald-200, rounded, rounded-md, rounded-lg, rounded-xl, rounded-full
Effects: shadow-sm, shadow, ring-2, ring-sky-200/50, opacity-0, opacity-20, opacity-40, opacity-50, opacity-100
Interactive: hover:bg-stone-50, hover:bg-stone-100, hover:bg-sky-600, hover:border-stone-300, hover:border-sky-400, hover:text-stone-600, hover:text-sky-700, hover:text-red-400, cursor-pointer, transition-colors, transition-all, transition-shadow, active:scale-95, disabled:opacity-40
Focus: focus:outline-none, focus:ring-2, focus:ring-sky-200/50, focus:border-sky-300
Other: resize-none, overflow-hidden, overflow-auto, inline-flex, block, hidden, relative, absolute, top-2, right-2, select-none, whitespace-nowrap, truncate, animate-pulse, accent-sky-500, placeholder:text-stone-400, group
</design_tokens>

<rules>
1. You MUST end with: render(<YourComponent />)
2. The component MUST call onSubmit(markdownString) when the user clicks submit. The markdown should use ## headings for each field label and the value underneath.
3. Use 2-6 input fields appropriate to the step.
4. Do NOT use import statements. Everything you need is in scope.
5. Keep the component self-contained — define it as a function, use hooks for state.
6. Style with Tailwind classes from the design tokens above. Match the app aesthetic: clean, minimal, stone/sky palette.
7. Include a Submit button styled like: className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-all disabled:opacity-40 active:scale-95"
8. All interactive elements must be accessible (labels, button text, etc.)
</rules>

<example>
Step: "Describe your target audience and key messaging preferences"

\`\`\`jsx
const Form = () => {
  const [audience, setAudience] = useState('');
  const [tone, setTone] = useState('');
  const [channels, setChannels] = useState([]);
  const tones = ['Professional', 'Casual', 'Friendly', 'Authoritative'];
  const channelOpts = ['Email', 'Social Media', 'Blog', 'Newsletter'];
  const toggle = (ch) => setChannels(p => p.includes(ch) ? p.filter(c => c !== ch) : [...p, ch]);
  const handleSubmit = () => {
    const parts = [];
    if (audience.trim()) parts.push('## Target Audience\\n' + audience.trim());
    if (tone) parts.push('## Preferred Tone\\n' + tone);
    if (channels.length) parts.push('## Channels\\n' + channels.map(c => '- ' + c).join('\\n'));
    if (parts.length) onSubmit(parts.join('\\n\\n'));
  };
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Target Audience</label>
        <textarea value={audience} onChange={e => setAudience(e.target.value)} placeholder="Describe your ideal audience..."
          className="w-full h-20 px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm text-stone-800 resize-none focus:outline-none focus:ring-2 focus:ring-sky-200/50 focus:border-sky-300 placeholder:text-stone-400 transition-shadow" />
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">Preferred Tone</label>
        <div className="flex flex-wrap gap-1.5">
          {tones.map(t => (
            <button key={t} type="button" onClick={() => setTone(t === tone ? '' : t)}
              className={\`px-2.5 py-1 rounded-full text-xs border transition-colors \${tone === t ? 'bg-sky-100 border-sky-300 text-sky-700' : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'}\`}>{t}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">Channels</label>
        <div className="space-y-1">
          {channelOpts.map(ch => (
            <label key={ch} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-stone-50 cursor-pointer transition-colors">
              <input type="checkbox" checked={channels.includes(ch)} onChange={() => toggle(ch)} className="rounded border-stone-300 text-sky-500 focus:ring-sky-200" />
              <span className="text-sm text-stone-700">{ch}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex justify-end pt-1">
        <button onClick={handleSubmit} disabled={!audience.trim() && !tone && !channels.length}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-all disabled:opacity-40 active:scale-95">
          <Send size={12} /> Submit
        </button>
      </div>
    </div>
  );
};
render(<Form />);
\`\`\`
</example>

<task>
${req.taskDescription}
</task>

<current_step index="${req.stepIndex}">
${req.stepDescription}
</current_step>

${previousContext ? `<previous_steps>\n${previousContext}\n</previous_steps>` : ''}

Generate the JSX code for a form tailored to this step. Wrap it in a single \`\`\`jsx code fence. The form should help the user provide structured, relevant input for this specific step.`;
}
