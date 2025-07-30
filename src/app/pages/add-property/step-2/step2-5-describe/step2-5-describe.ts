import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyFormStorageService } from '../../../../core/services/ListingWizard/property-form-storage.service';
import { ListingWizardService } from '../../../../core/services/ListingWizard/listing-wizard.service';
import { Subscription } from 'rxjs';

interface HighlightCombination {
  keys: string[];
  description: string;
}

@Component({
  selector: 'app-step2-5-describe',
  imports: [CommonModule],
  templateUrl: './step2-5-describe.html',
  styleUrl: './step2-5-describe.css'
})
export class Step25Describe implements OnInit, OnDestroy {
  private subscription!: Subscription;
  highlights = [
    { key: 'peaceful', label: 'Peaceful', icon: 'peaceful' },
    { key: 'unique', label: 'Unique', icon: 'unique' },
    { key: 'family', label: 'Family-friendly', icon: 'family' },
    { key: 'stylish', label: 'Stylish', icon: 'stylish' },
    { key: 'central', label: 'Central', icon: 'central' },
    { key: 'spacious', label: 'Spacious', icon: 'spacious' }
  ];
  selected: string[] = [];
  maxSelections = 2;

  private highlightCombinations: HighlightCombination[] = [
    { keys: ["peaceful", "unique"], description: "A serene escape with one-of-a-kind character—where quiet moments meet unforgettable charm." },
    { keys: ["peaceful", "family"], description: "Tranquil haven designed for family memories—where laughter blends with the sound of silence." },
    { keys: ["peaceful", "stylish"], description: "Calm meets curated elegance—a sanctuary of style and stillness." },
    { keys: ["peaceful", "central"], description: "Oasis in the heart of it all—where the city hums, but peace reigns." },
    { keys: ["peaceful", "spacious"], description: "Breathe deeply in a quiet expanse—room to unwind, space to dream." },
    { keys: ["unique", "family"], description: "Whimsical wonderland for all ages—a home as special as your crew." },
    { keys: ["unique", "stylish"], description: "A masterpiece of bold design—where every corner tells a story." },
    { keys: ["unique", "central"], description: "Standout gem in the city\"s pulse—unconventional, unbeatable location." },
    { keys: ["unique", "spacious"], description: "More than just roomy—a canvas of quirks and endless possibilities." },
    { keys: ["family", "stylish"], description: "Kid-friendly meets designer chic—playful luxury for the whole tribe." },
    { keys: ["family", "central"], description: "Adventures start at your doorstep—nestled where memories are made." },
    { keys: ["family", "spacious"], description: "Where chaos turns to joy—generous space for growing laughter." },
    { keys: ["stylish", "central"], description: "Design-forward digs in the trendiest zip code—live where the magic happens." },
    { keys: ["stylish", "spacious"], description: "Sleek, airy, and utterly Instagram-worthy—room to revel in refinement." },
    { keys: ["central", "spacious"], description: "Urban rarity: a sprawling retreat where everything\"s just steps away." }
  ];

  constructor(
    private formStorage: PropertyFormStorageService,
    private wizardService: ListingWizardService
  ) {}

  ngOnInit(): void {
    // Load saved data
    const savedData = this.formStorage.getStepData('step2-5');
    if (savedData?.selected) {
      this.selected = savedData.selected;
    }

    // Subscribe to next step event
    this.subscription = this.wizardService.nextStep$.subscribe(() => {
      this.saveFormData();
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  isSelected(key: string): boolean {
    return this.selected.includes(key);
  }

  selectHighlight(key: string): void {
    const idx = this.selected.indexOf(key);
    if (idx > -1) {
      // Remove the highlight if it's already selected
      this.selected = this.selected.filter(k => k !== key);
    } else if (this.selected.length < this.maxSelections) {
      // Add the new highlight
      this.selected = [...this.selected, key];
    } else if (this.selected.length === this.maxSelections) {
      // If we already have max selections, remove the first one and add the new one
      this.selected = [...this.selected.slice(1), key];
    }
    
    console.log('Current selection:', this.selected);
    this.saveFormData();
  }

  private getDescriptionForCombination(selected: string[]): string {
    if (selected.length !== 2) return "";
    
    // Sort both the selected keys and the stored combination keys for comparison
    const sortedSelected = [...selected].sort();
    
    const combination = this.highlightCombinations.find(c => {
      const sortedCombo = [...c.keys].sort();
      return sortedCombo[0] === sortedSelected[0] && sortedCombo[1] === sortedSelected[1];
    });

    console.log('Selected highlights:', sortedSelected);
    console.log('Found combination:', combination);
    
    return combination?.description || "";
  }

  private saveFormData(): void {
    const description = this.getDescriptionForCombination(this.selected);
    const data = {
      selected: this.selected,
      generatedDescription: description
    };
    this.formStorage.saveFormData('step2-5', data);
    // Also save to step2-6 to pre-populate the description
    this.formStorage.saveFormData('step2-6', { description });
  }
}
