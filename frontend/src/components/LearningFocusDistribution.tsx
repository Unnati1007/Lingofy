import React from 'react';
import { motion, type Variants } from 'framer-motion';
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

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <Card style={{ marginBottom: '24px' }}>
      <CardHeader style={{ padding: '20px 24px 12px 24px' }}>
        <CardTitle style={{ fontSize: '17px' }}>Learning Focus Distribution</CardTitle>
        <CardDescription style={{ fontSize: '12px' }}>Breakdown of how you spend your learning time</CardDescription>
      </CardHeader>
      
      <CardContent style={{ padding: '0 24px 18px 24px' }}>
        {total === 0 ? (
          <div style={{ height: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
            <p style={{ fontSize: '13px' }}>Complete a lesson to see your distribution!</p>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants} 
            initial="hidden" 
            animate="show"
            style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
          >
            {data.map((item, i) => {
              const isEmpty = item.count === 0;
              const pct = total === 0 ? 0 : Math.round((item.count / total) * 100);
              
              return (
                <React.Fragment key={i}>
                  <motion.div 
                    variants={itemVariants}
                    whileHover={{ scale: 1.005, backgroundColor: 'rgba(255,255,255,0.04)' }}
                    style={{ 
                      padding: '10px 14px', 
                      borderRadius: '12px', 
                      transition: 'background-color 0.2s',
                      backgroundColor: 'rgba(255,255,255,0.01)',
                      border: '1px solid rgba(255,255,255,0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* Refined Dot: Soft glow / ring */}
                        <div style={{ 
                          width: '10px', 
                          height: '10px', 
                          borderRadius: '50%', 
                          background: isEmpty ? 'transparent' : `radial-gradient(circle at 30% 30%, ${item.color}, #000)`,
                          border: isEmpty ? `1px solid rgba(255,255,255,0.2)` : `2px solid ${item.color}`,
                          boxShadow: isEmpty ? 'none' : `0 0 6px ${item.color}80`,
                          opacity: isEmpty ? 0.3 : 1
                        }}></div>
                        
                        <span style={{ 
                          fontSize: '13px', 
                          fontWeight: isEmpty ? '500' : '600', 
                          color: isEmpty ? 'rgba(255,255,255,0.5)' : '#fff' 
                        }}>
                          {item.label}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ 
                          fontSize: '12px', 
                          color: isEmpty ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.7)',
                          fontWeight: '500'
                        }}>
                          {item.count} {item.count === 1 ? 'quiz' : 'quizzes'}
                        </span>
                        <Badge variant={isEmpty ? 'outline' : 'default'} style={{ 
                          minWidth: '42px', 
                          padding: '1px 6px',
                          fontSize: '11px',
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
                  {i < data.length - 1 && <Separator style={{ margin: '2px 0', opacity: 0.05 }} />}
                </React.Fragment>
              );
            })}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
