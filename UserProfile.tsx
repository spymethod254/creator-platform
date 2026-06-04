import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Grid, Link2, ShieldCheck, Mail, Phone, Briefcase, Heart, ExternalLink } from 'lucide-react';

export default function UserProfile() {
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');

  const creatorData = {
    username: "Alex_TechCreator",
    fullName: "Alex Rivera",
    profilePicture: "https://unsplash.com",
    totalFollowers: "14.2K",
    totalFollowing: "382",
    workStatus: "Freelance",
    relationshipStatus: "Single",
    privateEmail: "alex.rivera.creations@