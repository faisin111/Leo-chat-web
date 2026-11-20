import { useEffect, useRef, useState, type ReactNode } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/shared/ui/button';
import { Copy, Download, Share2, Check } from 'lucide-react';
import { toast } from 'sonner';

interface QrCodeRendererProps {
  value: string;
  size?: number;
  userName?: string;
  userHandle?: string;
  userAvatar?: ReactNode;
  subtitle?: string;
  downloadFilename?: string;
}

export function QrCodeRenderer({
  value,
  size = 220,
  userName,
  userHandle,
  userAvatar,
  subtitle,
  downloadFilename = 'leochat-qr-code',
}: QrCodeRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !value) return;

    QRCode.toCanvas(
      canvasRef.current,
      value,
      {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      },
      (error) => {
        if (error) {
          console.error('Failed to generate QR code:', error);
        }
      },
    );
  }, [value, size]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: userName ? `Chat with ${userName} on LeoChat` : 'LeoChat Web',
          text: subtitle || 'Scan or open link to chat on LeoChat Web',
          url: value,
        });
        toast.success('Shared successfully');
      } catch (err: unknown) {
        if ((err as Error).name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${downloadFilename}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('QR Code downloaded as PNG');
    } catch {
      toast.error('Failed to download QR code');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {/* High-contrast Card designed for rapid camera scanning */}
      <div className="relative p-6 sm:p-8 bg-card border border-border/80 rounded-3xl shadow-xl shadow-primary/5 flex flex-col items-center text-center max-w-sm w-full transition-all">
        {/* User / Branding Header */}
        {userAvatar && <div className="mb-3">{userAvatar}</div>}

        {userName && (
          <h3 className="font-bold text-lg text-foreground tracking-tight">{userName}</h3>
        )}

        {userHandle && <p className="text-xs text-muted-foreground mb-4">@{userHandle}</p>}

        {/* QR Code Container with crisp white backing for instant camera detection */}
        <div className="p-3 bg-white rounded-2xl shadow-inner border border-zinc-200/80 inline-flex items-center justify-center overflow-hidden">
          <canvas ref={canvasRef} className="rounded-xl block max-w-full h-auto" />
        </div>

        {subtitle && (
          <p className="text-xs text-muted-foreground mt-4 px-2 leading-relaxed">{subtitle}</p>
        )}

        {/* Direct URL text badge */}
        <div className="mt-4 px-3 py-1.5 rounded-lg bg-muted text-[11px] text-muted-foreground font-mono truncate max-w-full select-all border border-border/50">
          {value}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          className="rounded-xl text-xs gap-1.5 shadow-2xs hover:bg-muted"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          {copied ? 'Copied' : 'Copy Link'}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="rounded-xl text-xs gap-1.5 shadow-2xs hover:bg-muted"
        >
          <Download className="w-3.5 h-3.5" />
          Download QR
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={handleShare}
          className="rounded-xl text-xs gap-1.5 shadow-md shadow-primary/25"
        >
          <Share2 className="w-3.5 h-3.5" />
          Share
        </Button>
      </div>
    </div>
  );
}
