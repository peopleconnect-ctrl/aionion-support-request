import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DURATION } from '../animations/transitions';

const SearchableSelect = ({ options, value, onChange, name, placeholder = "Type to search...", error, required }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes((value || '').toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(0);
    }
  }, [value, isOpen]);

  const handleInputChange = (e) => {
    setIsOpen(true);
    onChange(e);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < filteredOptions.length - 1 ? prev + 1 : prev
      );
      scrollToHighlight(highlightedIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
      scrollToHighlight(highlightedIndex - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions[highlightedIndex]) {
        handleSelect(filteredOptions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const scrollToHighlight = (index) => {
    if (!listRef.current) return;
    const items = listRef.current.children;
    if (items[index]) {
      items[index].scrollIntoView({
        block: 'nearest',
      });
    }
  };

  const handleSelect = (option) => {
    onChange({ target: { name, value: option } });
    setIsOpen(false);
  };

  const clearSelection = (e) => {
    e.stopPropagation();
    onChange({ target: { name, value: '' } });
    inputRef.current?.focus();
    setIsOpen(true);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%', zIndex: isOpen ? 100 : 1 }}>
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          name={name}
          value={value || ''}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`form-input ${error ? 'input-error' : ''}`}
          style={{ width: '100%', paddingRight: '32px' }}
          autoComplete="off"
        />
        {value && (
          <button
            type="button"
            onClick={clearSelection}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0',
            }}
          >
            &times;
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: DURATION.FAST }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              zIndex: 50,
              maxHeight: '220px',
              overflowY: 'auto',
              padding: '4px'
            }}
          >
            <ul ref={listRef} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <li
                    key={option}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(option)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    style={{
                      padding: '10px 14px',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#334155',
                      background: highlightedIndex === index ? '#f1f5f9' : 'transparent',
                      transition: 'background 0.15s ease',
                      fontWeight: option === value ? '600' : '400',
                    }}
                  >
                    {option}
                  </li>
                ))
              ) : (
                <li style={{ padding: '10px 14px', fontSize: '14px', color: '#94a3b8', textAlign: 'center' }}>
                  No departments found.
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchableSelect;
