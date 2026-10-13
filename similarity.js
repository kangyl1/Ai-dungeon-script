        function similarityScore(strA, strB) {
            if (strA === strB) return 1;
            // Budget belongs to this Auto-Cards invocation, never persistent state.
            if (similarityScore.remaining === undefined) similarityScore.remaining = 750000;
            if (similarityScore.remaining <= 0) return 0;
            const [cleanA, cleanB] = [strA, strB].map(str => limitString(str
                .replace(/[0-9\s]/g, ' ').trim().replace(/  +/g, ' ').toLowerCase(), 1400));
            // Charge normalization too, even when strings normalize identically.
            similarityScore.remaining -= strA.length + strB.length;
            if (similarityScore.remaining < 0) return 0;
            if (cleanA === cleanB) return 1;
            const n=cleanA.length,m=cleanB.length,cost=n*m;
            if (!n || !m) return 0;
            // Skipping fuzzy comparison preserves memories rather than deleting them.
            if (cost>120000 || cost>similarityScore.remaining) return 0;
            similarityScore.remaining -= cost;
            let previous=new Uint16Array(m+1),current=new Uint16Array(m+1);
            for(let j=0;j<=m;j++)previous[j]=j;
            for(let i=1;i<=n;i++){
                current[0]=i;
                for(let j=1;j<=m;j++)current[j]=Math.min(previous[j]+1,current[j-1]+1,previous[j-1]+(cleanA[i-1]===cleanB[j-1]?0:1));
                const swap=previous;previous=current;current=swap;
            }
            return 1-previous[m]/Math.max(n,m);
        }
