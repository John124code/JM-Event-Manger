import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Share2, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Copy, 
  Check,
  Mail,
  MessageCircle,
  QrCode
} from "lucide-react";
import { Event } from "@/contexts/EventsContext";

interface SocialSharingProps {
  event: Event;
  className?: string;
}

export const SocialSharing = ({ event, className = "" }: SocialSharingProps) => {
  const [copied, setCopied] = useState(false);
  const [shareCount, setShareCount] = useState(Math.floor(Math.random() * 100) + 50); // Mock share count

  // Generate event URL
  const eventUrl = `${window.location.origin}/events/${event.id}`;
  
  // Create share text
  const shareText = `Check out this amazing event: ${event.title} on ${event.date} at ${event.location}. Join me!`;

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}&quote=${encodeURIComponent(shareText)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(eventUrl)}&text=${encodeURIComponent(shareText)}&hashtags=events,${event.category.toLowerCase()}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${eventUrl}`)}`,
    email: `mailto:?subject=${encodeURIComponent(`Invitation: ${event.title}`)}&body=${encodeURIComponent(`${shareText}\n\nEvent Details:\n- Date: ${event.date}\n- Time: ${event.time}\n- Location: ${event.location}\n\nRegister here: ${eventUrl}`)}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopied(true);
      setShareCount(prev => prev + 1);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = eventUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSocialShare = (platform: string, url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
    setShareCount(prev => prev + 1);
  };

  const socialButtons = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: shareLinks.facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      textColor: 'text-white'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: shareLinks.twitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      textColor: 'text-white'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: shareLinks.linkedin,
      color: 'bg-blue-700 hover:bg-blue-800',
      textColor: 'text-white'
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: shareLinks.whatsapp,
      color: 'bg-green-600 hover:bg-green-700',
      textColor: 'text-white'
    },
    {
      name: 'Email',
      icon: Mail,
      url: shareLinks.email,
      color: 'bg-gray-600 hover:bg-gray-700',
      textColor: 'text-white'
    }
  ];

  return (
    <Card className={`glass p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Share2 className="w-5 h-5 text-primary" />
          Share Event
        </h3>
        <Badge variant="secondary" className="text-xs">
          {shareCount} shares
        </Badge>
      </div>

      {/* Social Media Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {socialButtons.map((social) => {
          const Icon = social.icon;
          return (
            <Button
              key={social.name}
              variant="outline"
              size="sm"
              className={`${social.color} ${social.textColor} border-none hover:scale-105 transition-transform`}
              onClick={() => handleSocialShare(social.name, social.url)}
            >
              <Icon className="w-4 h-4 mr-2" />
              {social.name}
            </Button>
          );
        })}
      </div>

      {/* Copy Link Section */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Share Link</label>
        <div className="flex gap-2">
          <Input
            value={eventUrl}
            readOnly
            className="flex-1 bg-muted text-muted-foreground"
            onClick={(e) => e.currentTarget.select()}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className={`${copied ? 'bg-green-50 border-green-200 text-green-700' : ''} transition-colors`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-1" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Quick Share Templates */}
      <div className="mt-6 space-y-3">
        <label className="text-sm font-medium text-foreground">Quick Share Templates</label>
        <div className="space-y-2">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Professional</p>
            <p className="text-sm">
              "I'm excited to attend {event.title} on {event.date}. This looks like a great opportunity for {event.category.toLowerCase()} enthusiasts!"
            </p>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Casual</p>
            <p className="text-sm">
              "Found this cool event happening in {event.location.split(',')[0]}! Who's joining me at {event.title}? 🎉"
            </p>
          </div>
        </div>
      </div>

      {/* Share Statistics */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Total Engagement</span>
          <div className="flex items-center gap-4">
            <span>👀 {Math.floor(shareCount * 4.2)} views</span>
            <span>💬 {Math.floor(shareCount * 0.8)} comments</span>
            <span>❤️ {Math.floor(shareCount * 1.5)} likes</span>
          </div>
        </div>
      </div>

      {/* QR Code Option */}
      <div className="mt-4 pt-4 border-t border-border">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full text-muted-foreground hover:text-foreground"
          onClick={() => {
            // In a real app, this would open a QR code modal
            alert("QR Code generation feature coming soon!");
          }}
        >
          <QrCode className="w-4 h-4 mr-2" />
          Generate QR Code
        </Button>
      </div>
    </Card>
  );
};
