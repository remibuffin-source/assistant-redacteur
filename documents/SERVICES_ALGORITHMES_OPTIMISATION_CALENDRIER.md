
# Services et Algorithmes d'Optimisation - Calendrier Multi-Plateformes
## Assistant Rédactionnel - Architecture Technique Avancée

---

## 🎯 Vue d'Ensemble

Cette architecture définit les services de données intelligents et les algorithmes d'optimisation qui alimentent le calendrier multi-plateformes révolutionnaire. L'accent est mis sur l'intelligence artificielle, l'optimisation temporelle et la performance en temps réel.

---

## 🧠 Service d'Optimisation Intelligente

### 1. Moteur d'Optimisation Principal

```typescript
// src/services/optimization/OptimizationEngine.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface OptimizationEngineState {
  isOptimizing: boolean;
  lastOptimization: Date | null;
  optimizationHistory: OptimizationResult[];
  mlModel: MLModel | null;
  
  // Actions
  optimizeSchedule: (criteria: OptimizationCriteria) => Promise<OptimalSchedule>;
  trainModel: (historicalData: HistoricalData[]) => Promise<void>;
  predictEngagement: (event: CalendarEvent) => Promise<EngagementPrediction>;
  analyzeAudience: (platform: Platform) => Promise<AudienceInsights>;
  
  // Configuration
  updateAlgorithmWeights: (weights: AlgorithmWeights) => void;
  setOptimizationStrategy: (strategy: OptimizationStrategy) => void;
}

export class OptimizationEngine {
  private mlPredictor: MLPredictor;
  private audienceAnalyzer: AudienceAnalyzer;
  private conflictDetector: ConflictDetector;
  private performanceTracker: PerformanceTracker;

  constructor() {
    this.mlPredictor = new MLPredictor();
    this.audienceAnalyzer = new AudienceAnalyzer();
    this.conflictDetector = new ConflictDetector();
    this.performanceTracker = new PerformanceTracker();
  }

  async optimizeSchedule(criteria: OptimizationCriteria): Promise<OptimalSchedule> {
    const startTime = performance.now();
    
    try {
      // 1. Analyse de l'audience par plateforme
      const audienceInsights = await this.analyzeMultiPlatformAudience(criteria.platforms);
      
      // 2. Prédiction d'engagement pour chaque créneau
      const timeSlots = await this.generateTimeSlots(criteria);
      const engagementPredictions = await this.predictEngagementForSlots(timeSlots, criteria);
      
      // 3. Optimisation multi-objectifs
      const optimizedSchedule = await this.multiObjectiveOptimization(
        engagementPredictions,
        criteria,
        audienceInsights
      );
      
      // 4. Détection et résolution des conflits
      const conflictAnalysis = await this.conflictDetector.analyzeSchedule(optimizedSchedule);
      const resolvedSchedule = await this.resolveConflicts(optimizedSchedule, conflictAnalysis);
      
      // 5. Validation et scoring final
      const finalSchedule = await this.validateAndScore(resolvedSchedule, criteria);
      
      // 6. Tracking des performances
      await this.performanceTracker.recordOptimization({
        criteria,
        result: finalSchedule,
        processingTime: performance.now() - startTime,
        algorithmsUsed: this.getUsedAlgorithms()
      });
      
      return finalSchedule;
      
    } catch (error) {
      console.error('Optimization failed:', error);
      throw new OptimizationError('Failed to optimize schedule', error);
    }
  }

  private async analyzeMultiPlatformAudience(platforms: Platform[]): Promise<Map<Platform, AudienceInsights>> {
    const insights = new Map<Platform, AudienceInsights>();
    
    await Promise.all(platforms.map(async (platform) => {
      const platformInsights = await this.audienceAnalyzer.analyze(platform);
      insights.set(platform, platformInsights);
    }));
    
    return insights;
  }

  private async generateTimeSlots(criteria: OptimizationCriteria): Promise<TimeSlot[]> {
    const slots: TimeSlot[] = [];
    const { start, end } = criteria.timeRange;
    const interval = 30; // 30 minutes intervals
    
    let current = new Date(start);
    while (current < end) {
      // Vérifier les contraintes
      if (this.isValidTimeSlot(current, criteria.constraints)) {
        slots.push({
          start: new Date(current),
          end: new Date(current.getTime() + interval * 60 * 1000),
          duration: interval
        });
      }
      current.setMinutes(current.getMinutes() + interval);
    }
    
    return slots;
  }

  private async predictEngagementForSlots(
    slots: TimeSlot[], 
    criteria: OptimizationCriteria
  ): Promise<EngagementPrediction[]> {
    return Promise.all(slots.map(async (slot) => {
      const predictions = await Promise.all(criteria.platforms.map(async (platform) => {
        const prediction = await this.mlPredictor.predictEngagement({
          platform,
          timeSlot: slot,
          historicalData: await this.getHistoricalData(platform),
          audienceData: await this.audienceAnalyzer.getAudienceActivity(platform, slot)
        });
        
        return { platform, ...prediction };
      }));
      
      return {
        timeSlot: slot,
        platformPredictions: predictions,
        aggregatedScore: this.calculateAggregatedScore(predictions, criteria.objectives)
      };
    }));
  }

  private async multiObjectiveOptimization(
    predictions: EngagementPrediction[],
    criteria: OptimizationCriteria,
    audienceInsights: Map<Platform, AudienceInsights>
  ): Promise<OptimalSchedule> {
    // Algorithme génétique pour optimisation multi-objectifs
    const geneticAlgorithm = new GeneticAlgorithm({
      populationSize: 100,
      generations: 50,
      mutationRate: 0.1,
      crossoverRate: 0.8,
      objectives: criteria.objectives,
      constraints: criteria.constraints
    });
    
    const solution = await geneticAlgorithm.optimize(predictions, audienceInsights);
    
    return {
      recommendations: solution.recommendations,
      predictedPerformance: solution.performance,
      improvements: solution.improvements,
      conflictsResolved: [],
      generatedAt: new Date(),
      algorithm: 'genetic_multi_objective',
      version: '2.1.0'
    };
  }

  private calculateAggregatedScore(
    predictions: PlatformPrediction[], 
    objectives: OptimizationObjective[]
  ): number {
    const weights = {
      engagement: 0.4,
      reach: 0.3,
      clicks: 0.2,
      conversions: 0.1
    };
    
    return predictions.reduce((total, pred) => {
      return total + objectives.reduce((objScore, objective) => {
        return objScore + (pred[objective] || 0) * (weights[objective] || 0);
      }, 0);
    }, 0) / predictions.length;
  }
}
```

### 2. Prédicteur Machine Learning

```typescript
// src/services/optimization/MLPredictor.ts
export class MLPredictor {
  private models: Map<Platform, TensorFlowModel> = new Map();
  private featureExtractor: FeatureExtractor;
  private modelTrainer: ModelTrainer;

  constructor() {
    this.featureExtractor = new FeatureExtractor();
    this.modelTrainer = new ModelTrainer();
    this.initializeModels();
  }

  async predictEngagement(input: PredictionInput): Promise<EngagementPrediction> {
    const { platform, timeSlot, historicalData, audienceData } = input;
    
    // 1. Extraction des features
    const features = await this.featureExtractor.extract({
      temporal: this.extractTemporalFeatures(timeSlot),
      audience: this.extractAudienceFeatures(audienceData),
      historical: this.extractHistoricalFeatures(historicalData),
      platform: this.extractPlatformFeatures(platform),
      seasonal: this.extractSeasonalFeatures(timeSlot.start),
      competitive: await this.extractCompetitiveFeatures(platform, timeSlot)
    });

    // 2. Prédiction avec le modèle spécialisé
    const model = this.models.get(platform);
    if (!model) {
      throw new Error(`No model available for platform: ${platform}`);
    }

    const prediction = await model.predict(features);
    
    // 3. Post-traitement et calibration
    const calibratedPrediction = this.calibratePrediction(prediction, platform);
    
    // 4. Calcul de la confiance
    const confidence = this.calculateConfidence(features, historicalData);
    
    return {
      engagement: calibratedPrediction.engagement,
      reach: calibratedPrediction.reach,
      clicks: calibratedPrediction.clicks,
      conversions: calibratedPrediction.conversions,
      confidence,
      factors: this.explainPrediction(features, prediction),
      modelVersion: model.version,
      predictedAt: new Date()
    };
  }

  private extractTemporalFeatures(timeSlot: TimeSlot): TemporalFeatures {
    const date = timeSlot.start;
    
    return {
      // Heure de la journée (0-23)
      hourOfDay: date.getHours(),
      
      // Jour de la semaine (0-6, 0=dimanche)
      dayOfWeek: date.getDay(),
      
      // Jour du mois (1-31)
      dayOfMonth: date.getDate(),
      
      // Mois (0-11)
      month: date.getMonth(),
      
      // Trimestre (1-4)
      quarter: Math.floor(date.getMonth() / 3) + 1,
      
      // Indicateurs booléens
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      isBusinessHour: date.getHours() >= 9 && date.getHours() <= 17,
      isEveningPeak: date.getHours() >= 18 && date.getHours() <= 21,
      isMorningPeak: date.getHours() >= 7 && date.getHours() <= 9,
      
      // Encodage cyclique pour capturer la périodicité
      hourSin: Math.sin(2 * Math.PI * date.getHours() / 24),
      hourCos: Math.cos(2 * Math.PI * date.getHours() / 24),
      dayOfWeekSin: Math.sin(2 * Math.PI * date.getDay() / 7),
      dayOfWeekCos: Math.cos(2 * Math.PI * date.getDay() / 7),
      monthSin: Math.sin(2 * Math.PI * date.getMonth() / 12),
      monthCos: Math.cos(2 * Math.PI * date.getMonth() / 12)
    };
  }

  private extractAudienceFeatures(audienceData: AudienceActivity): AudienceFeatures {
    return {
      // Activité de l'audience
      audienceActivity: audienceData.activity,
      audienceSize: audienceData.size,
      engagementRate: audienceData.engagementRate,
      
      // Données démographiques
      avgAge: audienceData.demographics?.avgAge || 0,
      genderDistribution: audienceData.demographics?.genderDistribution || {},
      topLocations: audienceData.demographics?.topLocations || [],
      
      // Comportement
      avgSessionDuration: audienceData.behavior?.avgSessionDuration || 0,
      bounceRate: audienceData.behavior?.bounceRate || 0,
      returnVisitorRate: audienceData.behavior?.returnVisitorRate || 0,
      
      // Tendances
      activityTrend: audienceData.trends?.activityTrend || 0,
      growthRate: audienceData.trends?.growthRate || 0
    };
  }

  private extractHistoricalFeatures(historicalData: HistoricalData[]): HistoricalFeatures {
    if (historicalData.length === 0) {
      return this.getDefaultHistoricalFeatures();
    }

    const recentData = historicalData.slice(-30); // 30 derniers points
    
    return {
      // Moyennes mobiles
      avgEngagement7d: this.calculateMovingAverage(recentData.slice(-7), 'engagement'),
      avgEngagement30d: this.calculateMovingAverage(recentData, 'engagement'),
      avgReach7d: this.calculateMovingAverage(recentData.slice(-7), 'reach'),
      avgReach30d: this.calculateMovingAverage(recentData, 'reach'),
      
      // Tendances
      engagementTrend: this.calculateTrend(recentData, 'engagement'),
      reachTrend: this.calculateTrend(recentData, 'reach'),
      
      // Volatilité
      engagementVolatility: this.calculateVolatility(recentData, 'engagement'),
      reachVolatility: this.calculateVolatility(recentData, 'reach'),
      
      // Performance relative
      bestPerformingHour: this.findBestPerformingHour(historicalData),
      bestPerformingDay: this.findBestPerformingDay(historicalData),
      
      // Saisonnalité
      seasonalityIndex: this.calculateSeasonalityIndex(historicalData),
      
      // Récence des données
      daysSinceLastPost: this.calculateDaysSinceLastPost(historicalData),
      postFrequency: this.calculatePostFrequency(historicalData)
    };
  }

  private async extractCompetitiveFeatures(
    platform: Platform, 
    timeSlot: TimeSlot
  ): Promise<CompetitiveFeatures> {
    // Analyse de la concurrence dans le créneau
    const competitorActivity = await this.analyzeCompetitorActivity(platform, timeSlot);
    
    return {
      competitorCount: competitorActivity.count,
      competitorEngagement: competitorActivity.avgEngagement,
      marketSaturation: competitorActivity.saturation,
      competitiveAdvantage: competitorActivity.advantage,
      trendingTopics: competitorActivity.trendingTopics,
      hashtagCompetition: competitorActivity.hashtagCompetition
    };
  }

  async trainModel(platform: Platform, trainingData: TrainingData[]): Promise<void> {
    console.log(`Training model for ${platform} with ${trainingData.length} samples`);
    
    // 1. Préparation des données
    const { features, labels } = await this.prepareTrainingData(trainingData);
    
    // 2. Division train/validation/test
    const { trainSet, validationSet, testSet } = this.splitData(features, labels);
    
    // 3. Construction du modèle
    const model = await this.buildModel(platform);
    
    // 4. Entraînement avec early stopping
    await this.trainWithEarlyStopping(model, trainSet, validationSet);
    
    // 5. Évaluation sur le set de test
    const evaluation = await this.evaluateModel(model, testSet);
    
    // 6. Sauvegarde du modèle
    await this.saveModel(platform, model, evaluation);
    
    // 7. Mise à jour du modèle actif
    this.models.set(platform, model);
    
    console.log(`Model training completed for ${platform}:`, evaluation);
  }

  private async buildModel(platform: Platform): Promise<TensorFlowModel> {
    const tf = await import('@tensorflow/tfjs');
    
    // Architecture spécialisée par plateforme
    const architecture = this.getArchitectureForPlatform(platform);
    
    const model = tf.sequential({
      layers: [
        // Couche d'entrée
        tf.layers.dense({
          inputShape: [architecture.inputSize],
          units: architecture.hiddenLayers[0],
          activation: 'relu',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
        }),
        
        // Dropout pour régularisation
        tf.layers.dropout({ rate: 0.3 }),
        
        // Couches cachées
        ...architecture.hiddenLayers.slice(1).map(units => [
          tf.layers.dense({
            units,
            activation: 'relu',
            kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
          }),
          tf.layers.dropout({ rate: 0.2 })
        ]).flat(),
        
        // Couche de sortie (multi-tâches)
        tf.layers.dense({
          units: 4, // engagement, reach, clicks, conversions
          activation: 'sigmoid'
        })
      ]
    });
    
    // Compilation avec optimiseur adaptatif
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae', 'mse']
    });
    
    return model;
  }

  private getArchitectureForPlatform(platform: Platform): ModelArchitecture {
    const architectures: Record<Platform, ModelArchitecture> = {
      instagram: {
        inputSize: 45,
        hiddenLayers: [128, 64, 32],
        outputSize: 4
      },
      tiktok: {
        inputSize: 42,
        hiddenLayers: [96, 48, 24],
        outputSize: 4
      },
      twitter: {
        inputSize: 48,
        hiddenLayers: [112, 56, 28],
        outputSize: 4
      },
      // ... autres plateformes
    };
    
    return architectures[platform] || architectures.instagram;
  }
}
```

### 3. Analyseur d'Audience Intelligent

```typescript
// src/services/optimization/AudienceAnalyzer.ts
export class AudienceAnalyzer {
  private cache: Map<string, CachedAudienceData> = new Map();
  private apiClients: Map<Platform, PlatformAPIClient> = new Map();

  async analyze(platform: Platform): Promise<AudienceInsights> {
    const cacheKey = `${platform}_${new Date().toDateString()}`;
    
    // Vérifier le cache
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      return cached.data;
    }

    try {
      // Collecte de données multi-sources
      const [
        platformData,
        analyticsData,
        behaviorData,
        demographicData
      ] = await Promise.all([
        this.fetchPlatformData(platform),
        this.fetchAnalyticsData(platform),
        this.fetchBehaviorData(platform),
        this.fetchDemographicData(platform)
      ]);

      // Analyse et fusion des données
      const insights = await this.synthesizeInsights({
        platform,
        platformData,
        analyticsData,
        behaviorData,
        demographicData
      });

      // Mise en cache
      this.cache.set(cacheKey, {
        data: insights,
        timestamp: new Date(),
        ttl: 6 * 60 * 60 * 1000 // 6 heures
      });

      return insights;

    } catch (error) {
      console.error(`Failed to analyze audience for ${platform}:`, error);
      return this.getFallbackInsights(platform);
    }
  }

  private async synthesizeInsights(data: AudienceDataSources): Promise<AudienceInsights> {
    const { platform, platformData, analyticsData, behaviorData, demographicData } = data;

    // Calcul de l'activité horaire
    const hourlyActivity = this.calculateHourlyActivity(platformData, behaviorData);
    
    // Calcul de l'activité quotidienne
    const dailyActivity = this.calculateDailyActivity(platformData, behaviorData);
    
    // Analyse démographique
    const demographics = this.analyzeDemographics(demographicData);
    
    // Calcul des tendances
    const trends = this.calculateTrends(analyticsData, platformData);
    
    // Score de qualité des données
    const dataQuality = this.assessDataQuality(data);

    return {
      platform,
      hourlyActivity,
      dailyActivity,
      demographics,
      trends,
      
      // Métadonnées
      lastUpdated: new Date(),
      sampleSize: this.calculateSampleSize(data),
      confidence: this.calculateConfidence(dataQuality),
      
      // Insights spécialisés
      peakEngagementHours: this.identifyPeakHours(hourlyActivity),
      optimalPostingFrequency: this.calculateOptimalFrequency(trends),
      audienceGrowthPrediction: this.predictAudienceGrowth(trends),
      seasonalPatterns: this.identifySeasonalPatterns(analyticsData)
    };
  }

  private calculateHourlyActivity(
    platformData: PlatformData, 
    behaviorData: BehaviorData
  ): HourlyActivity[] {
    const hourlyStats = Array(24).fill(null).map((_, hour) => ({
      hour,
      activity: 0,
      engagement: 0,
      reach: 0,
      interactions: 0
    }));

    // Agrégation des données par heure
    platformData.posts?.forEach(post => {
      const hour = new Date(post.timestamp).getHours();
      hourlyStats[hour].activity += post.views || 0;
      hourlyStats[hour].engagement += post.engagement || 0;
      hourlyStats[hour].reach += post.reach || 0;
      hourlyStats[hour].interactions += post.interactions || 0;
    });

    // Normalisation (0-1)
    const maxActivity = Math.max(...hourlyStats.map(h => h.activity));
    const maxEngagement = Math.max(...hourlyStats.map(h => h.engagement));

    return hourlyStats.map(stat => ({
      hour: stat.hour,
      activity: maxActivity > 0 ? stat.activity / maxActivity : 0,
      engagement: maxEngagement > 0 ? stat.engagement / maxEngagement : 0,
      
      // Métriques dérivées
      engagementRate: stat.activity > 0 ? stat.engagement / stat.activity : 0,
      interactionRate: stat.reach > 0 ? stat.interactions / stat.reach : 0,
      
      // Score composite
      score: this.calculateHourlyScore(stat, maxActivity, maxEngagement)
    }));
  }

  private identifyPeakHours(hourlyActivity: HourlyActivity[]): PeakHour[] {
    // Algorithme de détection de pics
    const peaks: PeakHour[] = [];
    const threshold = 0.7; // Seuil pour considérer un pic
    
    for (let i = 1; i < hourlyActivity.length - 1; i++) {
      const current = hourlyActivity[i];
      const prev = hourlyActivity[i - 1];
      const next = hourlyActivity[i + 1];
      
      // Détection de pic local
      if (current.score > threshold && 
          current.score > prev.score && 
          current.score > next.score) {
        
        peaks.push({
          hour: current.hour,
          score: current.score,
          type: this.classifyPeakType(current.hour),
          confidence: this.calculatePeakConfidence(current, hourlyActivity),
          duration: this.estimatePeakDuration(i, hourlyActivity),
          
          // Métriques du pic
          peakActivity: current.activity,
          peakEngagement: current.engagement,
          engagementRate: current.engagementRate
        });
      }
    }
    
    // Tri par score décroissant
    return peaks.sort((a, b) => b.score - a.score);
  }

  private classifyPeakType(hour: number): PeakType {
    if (hour >= 7 && hour <= 9) return 'morning_commute';
    if (hour >= 12 && hour <= 14) return 'lunch_break';
    if (hour >= 17 && hour <= 19) return 'evening_commute';
    if (hour >= 20 && hour <= 22) return 'prime_time';
    if (hour >= 23 || hour <= 1) return 'late_night';
    return 'off_peak';
  }

  async getAudienceActivity(platform: Platform, timeSlot: TimeSlot): Promise<AudienceActivity> {
    const insights = await this.analyze(platform);
    const hour = timeSlot.start.getHours();
    const day = timeSlot.start.getDay();
    
    const hourlyData = insights.hourlyActivity.find(h => h.hour === hour);
    const dailyData = insights.dailyActivity.find(d => d.day === day);
    
    if (!hourlyData || !dailyData) {
      return this.getDefaultAudienceActivity();
    }
    
    // Calcul de l'activité combinée
    const combinedActivity = (hourlyData.activity * 0.7) + (dailyData.activity * 0.3);
    const combinedEngagement = (hourlyData.engagement * 0.7) + (dailyData.engagement * 0.3);
    
    return {
      activity: combinedActivity,
      engagement: combinedEngagement,
      size: this.estimateAudienceSize(insights, timeSlot),
      engagementRate: combinedEngagement / Math.max(combinedActivity, 0.01),
      
      // Données contextuelles
      demographics: insights.demographics,
      behavior: {
        avgSessionDuration: this.estimateSessionDuration(timeSlot),
        bounceRate: this.estimateBounceRate(platform, timeSlot),
        returnVisitorRate: insights.trends.growth > 0 ? 0.3 : 0.2
      },
      
      trends: {
        activityTrend: this.calculateActivityTrend(insights, timeSlot),
        growthRate: insights.trends.growth
      }
    };
  }
}
```

### 4. Détecteur de Conflits Avancé

```typescript
// src/services/optimization/ConflictDetector.ts
export class ConflictDetector {
  private rules: ConflictRule[] = [];
  private platformLimits: Map<Platform, PlatformLimits> = new Map();

  constructor() {
    this.initializeRules();
    this.initializePlatformLimits();
  }

  async analyzeSchedule(schedule: OptimalSchedule): Promise<ConflictAnalysis> {
    const conflicts: ConflictDetection[] = [];
    const warnings: ConflictWarning[] = [];
    const suggestions: ConflictSuggestion[] = [];

    // Analyse par type de conflit
    const timeConflicts = await this.detectTimeConflicts(schedule.recommendations);
    const platformConflicts = await this.detectPlatformConflicts(schedule.recommendations);
    const audienceConflicts = await this.detectAudienceConflicts(schedule.recommendations);
    const contentConflicts = await this.detectContentConflicts(schedule.recommendations);
    const resourceConflicts = await this.detectResourceConflicts(schedule.recommendations);

    conflicts.push(
      ...timeConflicts,
      ...platformConflicts,
      ...audienceConflicts,
      ...contentConflicts,
      ...resourceConflicts
    );

    // Génération d'avertissements
    warnings.push(...this.generateWarnings(schedule.recommendations));

    // Génération de suggestions d'amélioration
    suggestions.push(...this.generateSuggestions(conflicts, schedule.recommendations));

    return {
      conflicts,
      warnings,
      suggestions,
      severity: this.calculateOverallSeverity(conflicts),
      resolutionComplexity: this.assessResolutionComplexity(conflicts),
      estimatedImpact: this.estimatePerformanceImpact(conflicts),
      analyzedAt: new Date()
    };
  }

  private async detectTimeConflicts(recommendations: ScheduleRecommendation[]): Promise<ConflictDetection[]> {
    const conflicts: ConflictDetection[] = [];
    
    // Groupement par plateforme
    const byPlatform = this.groupByPlatform(recommendations);
    
    for (const [platform, platformRecs] of byPlatform.entries()) {
      const platformLimits = this.platformLimits.get(platform);
      if (!platformLimits) continue;

      // Tri par heure
      const sortedRecs = platformRecs.sort((a, b) => 
        a.recommendedTime.getTime() - b.recommendedTime.getTime()
      );

      // Détection des chevauchements
      for (let i = 0; i < sortedRecs.length - 1; i++) {
        const current = sortedRecs[i];
        const next = sortedRecs[i + 1];
        
        const timeDiff = next.recommendedTime.getTime() - current.recommendedTime.getTime();
        const minInterval = platformLimits.minInterval * 60 * 1000; // en ms
        
        if (timeDiff < minInterval) {
          conflicts.push({
            id: `time_conflict_${current.eventId}_${next.eventId}`,
            type: ConflictType.TIME_OVERLAP,
            severity: this.calculateTimeSeverity(timeDiff, minInterval),
            eventIds: [current.eventId, next.eventId].filter(Boolean),
            events: [], // À remplir avec les événements complets
            title: `Conflit temporel sur ${platform}`,
            description: `Publications trop rapprochées (${Math.round(timeDiff / 60000)}min d'écart, minimum ${platformLimits.minInterval}min requis)`,
            impact: `Risque de cannibalisation de l'audience et baisse d'engagement`,
            suggestedResolution: {
              id: `resolve_time_${current.eventId}_${next.eventId}`,
              type: ResolutionType.RESCHEDULE,
              title: 'Décaler la publication',
              description: `Décaler la seconde publication de ${platformLimits.minInterval - Math.round(timeDiff / 60000)} minutes`,
              actions: [{
                type: 'update_event',
                eventId: next.eventId,
                changes: {
                  scheduledDate: new Date(current.recommendedTime.getTime() + minInterval)
                }
              }],
              impact