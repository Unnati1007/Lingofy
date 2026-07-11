import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

export function LearningFocusDistribution({ history }: { history: any[] }) {
  const total = history.length;
  const core = history.filter(a => ['easy', 'beginner', 'intermediate', 'hard'].includes(a.level)).length;
  const song = history.filter(a => a.level === 'dynamic').length;
  const focus = history.filter(a => a.level === 'focus').length;
  const pron = history.filter(a => a.level === 'pronunciation').length;

  const data = [
    { label: 'Core Lessons', count: core, color: '#3b82f6' },
    { label: 'Focus Areas', count: focus, color: '#eab308' },
    { label: 'Song Practice', count: song, color: '#a855f7' },
    { label: 'Pronunciation', count: pron, color: '#ef4444' }
  ];

  // The prompt asked to keep empty states looking intentionally empty
  // We should not filter out empty ones, but keep them visible (so we don't sort out the zero counts if the design implies they remain).
  // The original sorted by count, so we will still sort them, but zeroes stay at the bottom.
  data.sort((a,b) => b.count - a.count);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <Card style={{ marginBottom: '32px' }}>
      <CardHeader>
        <CardTitle>Learning Focus Distribution</CardTitle>
        <CardDescription>Breakdown of how you spend your learning time</CardDescription>
      </CardHeader>
      
      <CardContent>
        {total === 0 ? (
          <div style={{ height: '150px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
            <p>Complete a lesson to see your distribution!</p>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants} 
            initial="hidden" 
            animate="show"
            style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
          >
            {data.map((item, i) => {
              const isEmpty = item.count === 0;
              const pct = total === 0 ? 0 : Math.round((item.count / total) * 100);
              
              return (
                <React.Fragment key={i}>
                  <motion.div 
                    variants={itemVariants}
                    whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.05)' }}
                    style={{ 
                      padding: '16px', 
                      borderRadius: '16px', 
                      transition: 'background-color 0.2s',
                      backgroundColor: 'rgba(255,255,255,0.01)',
                      border: '1px solid rgba(255,255,255,0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Refined Dot: Soft glow / ring */}
                        <div style={{ 
                          width: '14px', 
                          height: '14px', 
                          borderRadius: '50%', 
                          background: isEmpty ? 'transparent' : `radial-gradient(circle at 30% 30%, ${item.color}, #000)`,
                          border: isEmpty ? `1px solid rgba(255,255,255,0.2)` : `2px solid ${item.color}`,
                          boxShadow: isEmpty ? 'none' : `0 0 8px ${item.color}80`,
                          opacity: isEmpty ? 0.3 : 1
                        }}></div>
                        
                        <span style={{ 
                          fontSize: '15px', 
                          fontWeight: isEmpty ? '500' : '600', 
                          color: isEmpty ? 'rgba(255,255,255,0.5)' : '#fff' 
                        }}>
                          {item.label}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ 
                          fontSize: '13px', 
                          color: isEmpty ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.7)',
                          fontWeight: '500'
                        }}>
                          {item.count} {item.count === 1 ? 'quiz' : 'quizzes'}
                        </span>
                        <Badge variant={isEmpty ? 'outline' : 'default'} style={{ 
                          minWidth: '48px', 
                          justifyContent: 'center',
                          backgroundColor: isEmpty ? 'transparent' : `${item.color}20`,
                          color: isEmpty ? 'rgba(255,255,255,0.4)' : item.color,
                          borderColor: isEmpty ? 'rgba(255,255,255,0.1)' : 'transparent'
                        }}>
                          {pct}%
                        </Badge>
                      </div>
                    </div>
                    
                    <Progress 
                      value={pct} 
                      indicatorColor={item.color} 
                      isEmpty={isEmpty} 
                    />
                  </motion.div>
                  {i < data.length - 1 && <Separator style={{ margin: '4px 0' }} />}
                </React.Fragment>
              );
            })}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
