
'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Settings, Upload } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';

// Function to crop the image
function getCroppedImg(image: HTMLImageElement, crop: Crop) {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  return canvas.toDataURL('image/jpeg');
}

export function ProfileButton() {
  const {
    userName,
    profilePicture,
    setProfilePicture,
    setTasks,
    setGoals,
    setHealthMetrics,
    setDiaryEntries,
    setOnboarded,
    setCycleInfo,
    setLoggedSymptoms,
    setRelationshipTracker,
    setChatHistory,
  } = useAppContext();
  
  const { toast } = useToast();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);


  const getInitials = (name: string) => {
    return name?.charAt(0).toUpperCase() || 'U';
  };
  
  const handleSignOut = () => {
    localStorage.clear();
    setTasks([]);
    setGoals([]);
    setHealthMetrics([]);
    setDiaryEntries([]);
    setProfilePicture(null);
    setCycleInfo({ currentDay: 0, nextPeriodIn: 0, predictedDate: new Date(), lastPeriodDate: undefined });
    setLoggedSymptoms([]);
    setRelationshipTracker({ myBehavior: '3', hisBehavior: '3', progressLog: '', plans: '' });
    setChatHistory([]);
    if(setOnboarded) setOnboarded(false);

    toast({
      title: 'Signed Out',
      description: 'You have been signed out. The app will now reload.',
    });
    setTimeout(() => window.location.reload(), 1500);
  };
  
  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined); // Makes crop preview update between images.
      const reader = new FileReader();
      reader.addEventListener('load', () =>
        setImgSrc(reader.result?.toString() || '')
      );
      reader.readAsDataURL(e.target.files[0]);
      setIsCropDialogOpen(true);
      // Clear the input value to allow re-selecting the same file
      e.target.value = '';
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const newCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        1, // aspect ratio 1:1
        width,
        height
      ),
      width,
      height
    );
    setCrop(newCrop);
  };
  
  const handleSaveCrop = () => {
    if (imgRef.current && crop?.width && crop?.height) {
      const croppedImageUrl = getCroppedImg(imgRef.current, crop);
      if (croppedImageUrl) {
        setProfilePicture(croppedImageUrl);
        toast({
          title: 'Profile Picture Updated',
          description: 'Your new picture has been saved.',
        });
      }
    }
    setIsCropDialogOpen(false);
    setImgSrc('');
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-auto w-full items-center justify-start gap-3 p-2"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={profilePicture || undefined} alt={userName} />
              <AvatarFallback>{getInitials(userName)}</AvatarFallback>
            </Avatar>
            <span className="truncate text-sm font-medium">{userName}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{userName}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
           <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>Preferences</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            <span>Upload Picture</span>
            <input
              type="file"
              ref={fileInputRef}
              onChange={onSelectFile}
              className="hidden"
              accept="image/*"
            />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsAlertOpen(true)}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all your local data and you will need to start fresh. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOut}>Sign Out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isCropDialogOpen} onOpenChange={setIsCropDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crop your new picture</DialogTitle>
          </DialogHeader>
          {imgSrc && (
            <div className="flex justify-center">
              <ReactCrop
                crop={crop}
                onChange={c => setCrop(c)}
                aspect={1}
                circularCrop
              >
                <img ref={imgRef} alt="Crop me" src={imgSrc} onLoad={onImageLoad} style={{maxHeight: '70vh'}}/>
              </ReactCrop>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveCrop}>Save Picture</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
