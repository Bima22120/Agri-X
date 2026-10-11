import React from 'react';
import { TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';

export const PriceTicker = ({ commodities, onSelectCommodity, selectedId }) => {
  return (
    <div className="ticker-strip">
      <div className="ticker-strip-badge">
        <RefreshCw size={12} className="spin-slow" />
        <span>PIHPS JATIM · UPDATE HARIAN</span>
      </div>

      <div className="ticker-strip-content">
        {commodities.concat(commodities).map((item, idx) => {
          const isUp = item.trend === 'up';
          const isDown = item.trend === 'down';
          return (
            <div 
              key={`${item.id}-${idx}`} 
              className="ticker-item"
              onClick={() => onSelectCommodity(item.id)}
              title={`Klik untuk melihat grafik & analitik ${item.name}`}
            >
              <span style={{ fontWeight: 600, color: '#ffffff' }}>{item.name}</span>
              <span className="num-mono" style={{ fontWeight: 700 }}>
                Rp {item.currentPrice.toLocaleString('id-ID')}
              </span>
              <span 
                className={`num-mono badge ${isUp ? 'badge-up' : isDown ? 'badge-down' : 'badge-flat'}`}
                style={{ padding: '2px 5px', fontSize: '10px' }}
              >
                {isUp ? <TrendingUp size={10} /> : isDown ? <TrendingDown size={10} /> : <Minus size={10} />}
                {item.changePercent > 0 ? `+${item.changePercent}%` : `${item.changePercent}%`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
