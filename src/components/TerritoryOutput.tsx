import React from 'react';
import { GeneratedOutput } from '../App';

interface TerritoryOutputProps {
  generatedOutput: GeneratedOutput;
  onNewBrief: () => void;
}

export const TerritoryOutput: React.FC<TerritoryOutputProps> = ({ generatedOutput, onNewBrief }) => {
  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Territories */}
      <div className="backdrop-blur-xl bg-yellow-400/10 border border-yellow-400/20 rounded-3xl p-8 shadow-2xl">
        <h2 className="text-4xl font-black mb-8 text-yellow-400 drop-shadow-lg">
          TERRITORIES
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {generatedOutput.territories.map((territory, index) => (
            <div 
              key={territory.id} 
              className="bg-gradient-to-br from-yellow-400 via-yellow-300 to-yellow-500 text-black p-6 rounded-2xl shadow-xl shadow-yellow-400/20 hover:shadow-yellow-400/30 transition-all duration-300 hover:scale-105"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-xs font-bold text-red-600 mb-3 bg-white/20 px-2 py-1 rounded-full inline-block">
                {territory.id}
              </div>
              <h3 className="text-xl font-black mb-4">
                "{territory.title}"
              </h3>
              <div className="bg-black/10 p-3 rounded-xl">
                <div className="text-xs font-bold mb-2">POSITIONING</div>
                <p className="font-normal text-sm text-gray-800">{territory.positioning}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Executions */}
      <div className="backdrop-blur-xl bg-blue-400/10 border border-blue-400/20 rounded-3xl p-8 shadow-2xl">
        <h2 className="text-4xl font-black mb-8 text-blue-400 drop-shadow-lg">
          EXECUTIONS
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {generatedOutput.territories.map((territory, index) => (
            <div 
              key={territory.id} 
              className="bg-gradient-to-br from-blue-500 via-blue-400 to-blue-600 text-white p-6 rounded-2xl shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="bg-white/20 p-3 rounded-xl mb-4">
                <div className="text-xs font-bold mb-2">
                  TONE
                </div>
                <p className="font-normal text-sm">{territory.tone}</p>
              </div>
              <div className="bg-white/10 p-3 rounded-xl">
                <div className="text-xs font-bold mb-3">
                  HEADLINES
                </div>
                <div className="space-y-2">
                  {territory.headlines.map((headline, hIndex) => (
                    <div 
                      key={hIndex} 
                      className="font-normal text-sm bg-white/10 p-2 rounded-lg border-l-4 border-white/40"
                    >
                      "{headline}"
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance */}
      <div className="backdrop-blur-xl bg-orange-400/10 border border-orange-400/20 rounded-3xl p-8 shadow-2xl">
        <h2 className="text-4xl font-black mb-8 text-orange-400 drop-shadow-lg">
          COMPLIANCE CO-PILOT
        </h2>
        <div className="bg-gradient-to-br from-orange-500 via-orange-400 to-orange-600 text-white p-8 rounded-2xl shadow-xl shadow-orange-500/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 p-6 rounded-xl">
              <div className="text-sm font-bold mb-4 text-orange-100">POWERED BY</div>
              <ul className="font-normal text-sm space-y-2">
                {generatedOutput.compliance.powerBy.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/10 p-6 rounded-xl">
              <div className="text-sm font-bold mb-4 text-orange-100">OUTPUT</div>
              <p className="font-normal text-sm">
                {generatedOutput.compliance.output}
              </p>
            </div>
            <div className="bg-white/10 p-6 rounded-xl">
              <div className="text-sm font-bold mb-4 text-orange-100">COMPLIANCE NOTES</div>
              <ul className="font-normal text-sm space-y-2">
                {generatedOutput.compliance.notes.map((note, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <button className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 px-6 py-3 rounded-xl font-bold transition-all duration-300">
          📥 EXPORT PDF
        </button>
        <button className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 px-6 py-3 rounded-xl font-bold transition-all duration-300">
          📧 EMAIL BRIEF
        </button>
        <button 
          onClick={onNewBrief}
          className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 px-6 py-3 rounded-xl font-bold transition-all duration-300"
        >
          🔄 NEW BRIEF
        </button>
      </div>
    </div>
  );
};