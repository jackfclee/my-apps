<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:fn="http://www.w3.org/2005/xpath-functions">
  <xsl:param name="filterQuestion">*</xsl:param>
  <xsl:param name="filterType">*</xsl:param>

  <xsl:template match="/">
    <div class="row">
      <div class="col-sm-12 bg-light text-dark">
        <table id="resultTable" class="table table-striped">
          <thead>
            <tr>
              <th>Type</th>
              <th>Question</th>
              <th>Answer</th>
            </tr>
          </thead>
          <tbody>
          <xsl:for-each select="entries/entry">
            <xsl:variable name="lowercase">abcdefghijklmnopqrstuvwxyz</xsl:variable>
            <xsl:variable name="uppercase">ABCDEFGHIJKLMNOPQRSTUVWXYZ</xsl:variable>
            <xsl:if test="($filterType = '*' or (contains(translate(type, $uppercase, $lowercase), translate($filterType, $uppercase, $lowercase))))">
            <xsl:if test="($filterQuestion = '*' or (contains(translate(question, $uppercase, $lowercase), translate($filterQuestion, $uppercase, $lowercase))))">
            <tr>
              <td class="status-box active"><xsl:value-of select="type"/></td>
              <td><xsl:value-of select="question"/></td>
              <td><xsl:value-of select="answer"/></td>
            </tr>
            </xsl:if>
            </xsl:if>
          </xsl:for-each>
          </tbody>
        </table>
      </div>
    </div>
  </xsl:template>
</xsl:stylesheet>
