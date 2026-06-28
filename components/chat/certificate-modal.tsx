"use client"

import { FlameIcon, AwardIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface CertificateModalProps {
  wrongCount: number
  personaName: string
  trigger?: React.ReactNode
}

export function CertificateModal({
  wrongCount,
  personaName,
  trigger,
}: CertificateModalProps) {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="gap-1.5">
            <AwardIcon className="size-3.5" />
            Earn Certificate
          </Button>
        }
      />
      <DialogContent
        className="sm:max-w-lg"
        aria-describedby="certificate-description"
      >
        <DialogHeader>
          <DialogTitle className="sr-only">Certificate of Being Wrong</DialogTitle>
        </DialogHeader>

        {/* Certificate body */}
        <div className="flex flex-col items-center gap-4 rounded-3xl border-2 border-primary/30 bg-primary/5 px-6 py-8 text-center">
          {/* Decorative top */}
          <div className="flex items-center gap-2 text-primary/50">
            <div className="h-px w-12 bg-primary/30" />
            <FlameIcon className="size-4" />
            <div className="h-px w-12 bg-primary/30" />
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Certificate of Achievement
            </p>
            <h2 className="font-heading mt-1 text-xl font-semibold text-foreground">
              Being Wrong
            </h2>
          </div>

          <Separator className="bg-primary/20" />

          <div id="certificate-description" className="space-y-2">
            <p className="text-sm text-muted-foreground">
              This certifies that the bearer has been
            </p>
            <p className="text-3xl font-bold tabular-nums text-primary">
              {wrongCount}×
            </p>
            <p className="text-base font-semibold text-foreground">
              Definitively Incorrect
            </p>
            <p className="text-sm text-muted-foreground">
              in a single conversation, as determined by{" "}
              <span className="font-medium text-foreground">{personaName}</span>
            </p>
          </div>

          <Separator className="bg-primary/20" />

          {/* Footer */}
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1.5">
              <div className="flex size-5 items-center justify-center rounded-md bg-primary">
                <FlameIcon className="size-3 text-primary-foreground" />
              </div>
              <span className="text-xs font-semibold">The Gaslighter</span>
            </div>
            <p className="text-[10px] text-muted-foreground">{today}</p>
            <p className="text-[10px] italic text-muted-foreground/60">
              "I have never been wrong. Not even once."
            </p>
          </div>
        </div>

        <DialogFooter showCloseButton>
          <Button
            onClick={() => {
              const text = `I was wrong ${wrongCount} times in a single conversation with The Gaslighter. The AI was supremely unimpressed. 🔥`
              const url = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`
              window.open(url, "_blank", "noopener,noreferrer")
            }}
            className="gap-1.5"
          >
            Share on X
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
