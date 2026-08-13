import React, { useState, useEffect, useCallback } from 'react'
import { Star, Loader2, Pencil, Trash2, UserCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'

interface Review {
  id: string
  user_id: string
  product_id: string
  rating: number
  review_text: string | null
  created_at: string
  profiles: { name: string; avatar_url: string | null } | null
}

interface ReviewSectionProps {
  productId: string
}

function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
}: {
  value: number
  onChange?: (v: number) => void
  readonly?: boolean
  size?: 'sm' | 'md'
}) {
  const [hovered, setHovered] = useState(0)
  const px = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'

  return (
    <div className={`flex items-center gap-0.5 ${readonly ? '' : 'cursor-pointer'}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = (hovered || value) >= star
        return (
          <Star
            key={star}
            className={`${px} transition-colors ${
              filled ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
            }`}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            onClick={() => !readonly && onChange?.(star)}
          />
        )
      })}
    </div>
  )
}

export function ReviewSection({ productId }: ReviewSectionProps) {
  const { user, profile } = useAuth()
  const { showSuccess, showError } = useToast()

  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [myReview, setMyReview] = useState<Review | null>(null)

  // Form state
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles(name, avatar_url)')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })

      if (error) throw error
      const all = (data ?? []) as unknown as Review[]
      setReviews(all)

      if (user) {
        const mine = all.find((r) => r.user_id === user.id) ?? null
        setMyReview(mine)
        if (mine) {
          setRating(mine.rating)
          setReviewText(mine.review_text ?? '')
        }
      }
    } catch (err) {
      console.error('Reviews fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [productId, user])

  useEffect(() => { fetchReviews() }, [fetchReviews])

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0

  const handleSubmit = async () => {
    if (!user) { showError('Please sign in to leave a review.'); return }
    if (rating === 0) { showError('Please select a star rating.'); return }

    setSaving(true)
    try {
      if (myReview) {
        // Update existing review
        const { error } = await supabase
          .from('reviews')
          .update({ rating, review_text: reviewText.trim() || null })
          .eq('id', myReview.id)
        if (error) throw error
        showSuccess('Your review has been updated!')
      } else {
        // Insert new review
        const { error } = await supabase
          .from('reviews')
          .insert({
            user_id: user.id,
            product_id: productId,
            rating,
            review_text: reviewText.trim() || null,
          })
        if (error) throw error
        showSuccess('Review submitted! Thank you 🌟')
      }
      setEditing(false)
      await fetchReviews()
    } catch (err: any) {
      showError(err?.message ?? 'Failed to save review. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!myReview) return
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', myReview.id)
      if (error) throw error
      showSuccess('Review deleted.')
      setMyReview(null)
      setRating(0)
      setReviewText('')
      await fetchReviews()
    } catch (err) {
      showError('Failed to delete review.')
    }
  }

  const showForm = user && (!myReview || editing)

  return (
    <div className="space-y-4 pt-3">
      {/* Summary Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-black text-slate-900">
            {avgRating > 0 ? avgRating.toFixed(1) : '—'}
          </span>
          <div>
            <StarRating value={Math.round(avgRating)} readonly size="sm" />
            <p className="text-[11px] text-slate-500 mt-0.5">
              {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Write / Edit button for logged-in users who haven't reviewed yet */}
        {user && myReview && !editing && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-700"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Write / Edit Form */}
      {showForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <p className="text-xs font-bold text-slate-700">
            {myReview ? 'Edit your review' : 'Write a review'}
          </p>
          <div className="flex items-center gap-2">
            <StarRating value={rating} onChange={setRating} />
            {rating > 0 && (
              <span className="text-[11px] text-slate-500 font-medium">
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
              </span>
            )}
          </div>
          <textarea
            placeholder="Share your experience with this product (optional)"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={3}
            className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none resize-none transition-colors"
          />
          <div className="flex gap-2 justify-end">
            {editing && (
              <button
                onClick={() => { setEditing(false); setRating(myReview?.rating ?? 0); setReviewText(myReview?.review_text ?? '') }}
                className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={saving || rating === 0}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              {myReview ? 'Update Review' : 'Submit Review'}
            </button>
          </div>
        </div>
      )}

      {!user && (
        <p className="text-xs text-slate-500 text-center py-3">
          <a href="/login" className="text-blue-600 font-semibold hover:underline">Sign in</a> to leave a review.
        </p>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4">
          No reviews yet — be the first! ✨
        </p>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className={`p-3 rounded-xl border ${
                rev.user_id === user?.id
                  ? 'border-blue-200 bg-blue-50/40'
                  : 'border-slate-100 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {rev.profiles?.avatar_url ? (
                    <img
                      src={rev.profiles.avatar_url}
                      alt={rev.profiles.name}
                      className="w-6 h-6 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <UserCircle className="w-6 h-6 text-slate-400" />
                  )}
                  <span className="text-xs font-bold text-slate-800">
                    {rev.profiles?.name ?? 'User'}
                    {rev.user_id === user?.id && (
                      <span className="ml-1.5 text-[9px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">You</span>
                    )}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {new Date(rev.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <StarRating value={rev.rating} readonly size="sm" />
              {rev.review_text && (
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{rev.review_text}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
