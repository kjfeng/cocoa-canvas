import { useState, useEffect, useCallback, useMemo, useRef, useContext } from 'react';
import { LiveProvider, LivePreview, LiveContext } from 'react-live';
import {
  ChevronUp, ChevronDown, Check, X, Plus, Minus, Star, Heart,
  ThumbsUp, ThumbsDown, ArrowRight, Send, Info, AlertCircle,
  HelpCircle, Search, Filter, Edit, Trash2, Copy, RefreshCw,
  Eye, EyeOff, ChevronLeft, ChevronRight, GripVertical,
  Calendar, Clock, MapPin, User, Mail, Phone, Link, Hash, Tag,
  Flag, Bookmark, Award, Zap, Target, TrendingUp, BarChart2,
  PieChart, List, Grid, Layout, Layers, Settings, Sliders,
} from 'lucide-react';

interface Props {
  code: string;
  onSubmit: (markdown: string) => void;
  onError: () => void;
}

const scope = {
  useState, useEffect, useCallback, useMemo,
  ChevronUp, ChevronDown, Check, X, Plus, Minus, Star, Heart,
  ThumbsUp, ThumbsDown, ArrowRight, Send, Info, AlertCircle,
  HelpCircle, Search, Filter, Edit, Trash2, Copy, RefreshCw,
  Eye, EyeOff, ChevronLeft, ChevronRight, GripVertical,
  Calendar, Clock, MapPin, User, Mail, Phone, Link, Hash, Tag,
  Flag, Bookmark, Award, Zap, Target, TrendingUp, BarChart2,
  PieChart, List, Grid, Layout, Layers, Settings, Sliders,
};

export default function DynamicFormRenderer({ code, onSubmit, onError }: Props) {
  const previewRef = useRef<HTMLDivElement>(null);
  const errorNotified = useRef(false);

  const onSubmitRef = useRef(onSubmit);
  onSubmitRef.current = onSubmit;
  const stableOnSubmit = useCallback((markdown: string) => {
    onSubmitRef.current(markdown);
  }, []);

  // Detect empty render (LLM forgot render() call) via timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      if (previewRef.current && previewRef.current.childElementCount === 0 && !errorNotified.current) {
        errorNotified.current = true;
        onError();
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [onError]);

  const liveScope = useMemo(() => ({ ...scope, onSubmit: stableOnSubmit }), [stableOnSubmit]);

  return (
    <LiveProvider code={code} scope={liveScope} noInline>
      <div ref={previewRef}>
        <LivePreview />
      </div>
      <LiveErrorDetector onError={onError} />
    </LiveProvider>
  );
}

function LiveErrorDetector({ onError }: { onError: () => void }) {
  const { error } = useContext(LiveContext);
  const called = useRef(false);

  useEffect(() => {
    if (error && !called.current) {
      called.current = true;
      onError();
    }
  }, [error, onError]);

  return null;
}
